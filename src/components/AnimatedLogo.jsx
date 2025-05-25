
    import React, { useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Zap, Circle, Triangle, Square } from 'lucide-react';
    import { Link } from 'react-router-dom';

    const logoText = "Pagoul!";
    const highlightColor = "text-yellow-400"; // Usado para '!' e hover
    const primaryColor = "text-primary"; // Cor primária para o '!'

    const letterVariants = {
      hidden: { opacity: 0, y: -20 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.08,
          type: 'spring',
          stiffness: 130,
          damping: 10,
        },
      }),
    };

    const generateShapes = (count) => {
      const shapeTypes = [
        { Icon: Circle, baseColor: 'text-blue-500', stroke: true, fill: false },
        { Icon: Circle, baseColor: 'text-purple-500', stroke: true, fill: false },
        { Icon: Square, baseColor: 'text-red-500', stroke: true, fill: false },
        { Icon: Triangle, baseColor: 'text-orange-500', stroke: false, fill: true },
        { Icon: Zap, baseColor: 'text-yellow-400', stroke: false, fill: true },
      ];
      const newShapes = [];
      for (let i = 0; i < count; i++) {
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        newShapes.push({
          id: i,
          Icon: type.Icon,
          color: type.baseColor,
          stroke: type.stroke,
          fill: type.fill,
          size: Math.random() * 8 + 4, // Tamanho entre 4px e 12px
          initialX: Math.random() * 10 - 5, // Posição X inicial perto do centro
          initialY: Math.random() * 10 - 5, // Posição Y inicial perto do centro
          animateToX: (Math.random() - 0.5) * 200, // Espalhar até 100px em X
          animateToY: (Math.random() - 0.5) * 150, // Espalhar até 75px em Y
          rotation: (Math.random() - 0.5) * 720, // Rotação até 360 graus
          scale: Math.random() * 0.5 + 0.5, // Escala entre 0.5 e 1
          duration: Math.random() * 3 + 2, // Duração entre 2s e 5s
          delay: Math.random() * 1, // Atraso inicial
        });
      }
      return newShapes;
    };


    const AnimatedLogo = ({ className }) => {
      const shapes = useMemo(() => generateShapes(50), []); // Gerar 50 shapes. 200 pode ser muito pesado.

      const shapeContainerVariants = {
        animate: {
          transition: {
            staggerChildren: 0.02,
          },
        },
      };
      
      const individualShapeVariants = {
        initial: (shape) => ({
          opacity: 0,
          x: shape.initialX,
          y: shape.initialY,
          scale: 0.1,
          rotate: 0,
        }),
        animate: (shape) => ({
          opacity: [0, 0.7, 0.7, 0],
          x: [shape.initialX, shape.animateToX],
          y: [shape.initialY, shape.animateToY],
          scale: [0.1, shape.scale, shape.scale * 0.8, 0.1],
          rotate: [0, shape.rotation],
          transition: {
            duration: shape.duration,
            delay: shape.delay,
            ease: "circOut",
            repeat: Infinity,
            repeatDelay: 1, // Pequeno intervalo antes de repetir
          },
        }),
      };


      return (
        <Link to="/" className={`relative flex items-center group ${className || ''} h-12 md:h-14 overflow-visible`}>
          <motion.div 
            className="absolute inset-0 -z-10 flex items-center justify-center"
            variants={shapeContainerVariants}
            initial="initial"
            animate="animate"
          >
            {shapes.map((shape) => (
              <motion.div
                key={shape.id}
                custom={shape}
                variants={individualShapeVariants}
                className={`absolute ${shape.color}`}
                style={{ width: shape.size, height: shape.size }}
              >
                <shape.Icon 
                  className="w-full h-full"
                  fill={shape.fill ? "currentColor" : "none"}
                  stroke={shape.stroke ? "currentColor" : "none"}
                  strokeWidth={shape.stroke ? 1.5 : 0}
                />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div className="flex items-center" aria-label={logoText}>
            {logoText.split("").map((letter, index) => {
              const isCentralHover = index > 0 && index < logoText.length - 2; // A, G, O, U, L
              const isExclamation = letter === '!';
              
              return (
                <motion.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className={`
                    text-3xl md:text-4xl font-extrabold tracking-tight
                    ${isExclamation ? primaryColor : 'text-slate-800 dark:text-white'}
                    group-hover:scale-110 transition-transform duration-150 ease-out
                    ${isCentralHover ? `group-hover:${highlightColor}` : ''}
                  `}
                  style={{ 
                    display: 'inline-block', 
                    fontFamily: "'Poppins', sans-serif",
                    position: 'relative', // Para z-index funcionar se necessário
                    zIndex: 1 // Para ficar acima dos shapes
                  }}
                >
                  {letter}
                </motion.span>
              );
            })}
          </motion.div>
        </Link>
      );
    };

    export default AnimatedLogo;
  