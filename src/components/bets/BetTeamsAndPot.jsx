
    import React from 'react';
    import { Card, CardContent } from '@/components/ui/card';

    const BetTeamsAndPot = ({ bet, selectedTeam, isBetOpen, userHasBet }) => {
      const calculateTeamPot = (teamName) => {
        return bet.bets.filter(b => b.team === teamName).reduce((sum, b) => sum + b.amount, 0);
      };

      const teamAPot = calculateTeamPot(bet.teamA);
      const teamBPot = calculateTeamPot(bet.teamB);
      const totalBetPot = teamAPot + teamBPot;

      const getPotPercentage = (teamPot) => {
        if (totalBetPot === 0) return "0.0";
        return ((teamPot / totalBetPot) * 100).toFixed(1);
      };

      return (
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-3">Times e Apostas</h3>
            <div className="space-y-4">
              {[bet.teamA, bet.teamB].map((teamName) => {
                const pot = calculateTeamPot(teamName);
                return (
                  <Card key={teamName} className={`p-4 ${selectedTeam === teamName && isBetOpen && !userHasBet ? 'border-primary ring-2 ring-primary' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{teamName}</span>
                      <span className="text-xl font-bold text-primary">R$ {pot.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{getPotPercentage(pot)}% das apostas</p>
                  </Card>
                );
              })}
            </div>
            <p className="text-right mt-2 text-sm font-semibold">Pot Total: R$ {totalBetPot.toFixed(2)}</p>
          </CardContent>
        </Card>
      );
    };

    export default BetTeamsAndPot;
  