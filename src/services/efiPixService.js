
    import { Buffer } from 'buffer';

    const EFI_SANDBOX_URL = 'https://apis.sandbox.efi.com.br';
    const EFI_PROD_URL = 'https://apis.efi.com.br'; 
    const EFI_AUTH_PATH = '/oauth/token';
    const EFI_CREATE_CHARGE_PATH = '/v2/gn/cob';
    const EFI_PIX_KEY = 'sua-chave-pix@email.com'; 

    class EfiPixService {
      constructor(clientId, clientSecret, useSandbox = true, pixKey = EFI_PIX_KEY) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.useSandbox = useSandbox;
        this.baseUrl = useSandbox ? EFI_SANDBOX_URL : EFI_PROD_URL;
        this.accessToken = null;
        this.tokenExpiresAt = 0;
        this.pixKey = pixKey; 
      }

      async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
          return this.accessToken;
        }

        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const authUrl = this.baseUrl + EFI_AUTH_PATH;

        try {
          const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grant_type: 'client_credentials' }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error_description: 'Failed to get access token and parse error' }));
            console.error('Efí Auth Error Response:', errorData);
            throw new Error(`Efí authentication failed: ${errorData.error_description || response.statusText}`);
          }

          const data = await response.json();
          this.accessToken = data.access_token;
          this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; 
          return this.accessToken;
        } catch (error) {
          console.error('Error fetching Efí access token:', error);
          throw error;
        }
      }

      async createImmediateCharge(valor, cpfDevedor, nomeDevedor, infoAdicionais = [], expiracao = 3600) {
        if (!this.pixKey) {
          throw new Error('PIX key is not configured in EfiPixService.');
        }
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}${EFI_CREATE_CHARGE_PATH}`;
        
        const body = {
          calendario: {
            expiracao: expiracao,
          },
          devedor: {
            cpf: cpfDevedor.replace(/\D/g, ''),
            nome: nomeDevedor,
          },
          valor: {
            original: valor.toFixed(2),
          },
          chave: this.pixKey, 
          solicitacaoPagador: 'Pagamento de aposta online',
        };

        if (infoAdicionais.length > 0) {
          body.infoAdicionais = infoAdicionais;
        }

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error('Efí Create Charge Error Response:', responseData);
            const errorMessage = responseData.mensagem || responseData.title || JSON.stringify(responseData);
            throw new Error(`Failed to create Efí charge: ${errorMessage}`);
          }
          
          const qrCodeResponse = await this.generateQrCode(responseData.loc.id);
          
          return {
            txid: responseData.txid,
            calendario: responseData.calendario,
            locId: responseData.loc.id,
            valor: responseData.valor.original,
            status: responseData.status,
            pixCopiaECola: qrCodeResponse.pixCopiaECola,
            imagemQrcode: qrCodeResponse.imagemQrcode,
            linkVisualizacao: responseData.linkVisualizacao,
            dataExpiracao: new Date(Date.now() + expiracao * 1000).toISOString(),
          };

        } catch (error) {
          console.error('Error creating Efí immediate charge:', error);
          throw error;
        }
      }

       async generateQrCode(locId) {
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}/v2/gn/loc/${locId}/qrcode`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Efí Generate QR Code Error Response:', responseData);
                throw new Error(`Failed to generate Efí QR code: ${responseData.mensagem || responseData.title}`);
            }
            return {
                pixCopiaECola: responseData.qrcode,
                imagemQrcode: responseData.imagemQrcode,
            };
        } catch (error) {
            console.error('Error generating Efí QR code:', error);
            throw error;
        }
    }
  }

  export default EfiPixService;
  