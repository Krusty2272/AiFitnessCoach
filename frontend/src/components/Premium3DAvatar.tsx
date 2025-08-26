import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D, Center, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Premium3DAvatarProps {
  emoji: string;
  isSelected?: boolean;
  isLocked?: boolean;
  size?: number;
}

// 3D компонент для отдельного аватара
const Avatar3D: React.FC<{ emoji: string; isSelected: boolean; isLocked: boolean }> = ({ emoji, isSelected, isLocked }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Анимация вращения
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += isSelected ? 0.02 : 0.005;
      
      // Пульсация для выбранного
      if (isSelected && meshRef.current) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      }
    }
  });

  // Цвет в зависимости от состояния
  const color = useMemo(() => {
    if (isLocked) return '#666666';
    if (isSelected) return '#ffd700';
    return '#667eea';
  }, [isLocked, isSelected]);

  return (
    <group ref={groupRef}>
      <Float 
        speed={isLocked ? 0 : 2}
        rotationIntensity={isLocked ? 0 : 0.5}
        floatIntensity={isLocked ? 0 : 0.5}
      >
        {/* Основная сфера с эмодзи */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            metalness={isLocked ? 0.1 : 0.8}
            roughness={isLocked ? 0.9 : 0.2}
            clearcoat={isLocked ? 0 : 1}
            clearcoatRoughness={0.1}
            transmission={isLocked ? 0 : 0.3}
            ior={1.5}
            emissive={isSelected ? '#ffd700' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>

        {/* Текст эмодзи */}
        <Center>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={1}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {emoji}
            <meshPhysicalMaterial
              color={isLocked ? '#444444' : '#ffffff'}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
            />
          </Text3D>
        </Center>

        {/* Эффект блокировки */}
        {isLocked && (
          <mesh position={[0, 0, 1.6]}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial 
              transparent 
              opacity={0.8}
              map={null}
              color="#000000"
            />
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.5}
              height={0.1}
              position={[-0.5, -0.2, 0.1]}
            >
              🔒
              <meshBasicMaterial color="#ffd700" />
            </Text3D>
          </mesh>
        )}

        {/* Золотое кольцо вокруг премиум аватара */}
        {!isLocked && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2, 0.1, 16, 100]} />
              <meshPhysicalMaterial
                color="#ffd700"
                metalness={1}
                roughness={0}
                emissive="#ffd700"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Звезды вокруг */}
            {[...Array(5)].map((_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const x = Math.cos(angle) * 2.5;
              const z = Math.sin(angle) * 2.5;
              
              return (
                <mesh key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
                  <coneGeometry args={[0.2, 0.4, 4]} />
                  <meshPhysicalMaterial
                    color="#ffd700"
                    emissive="#ffd700"
                    emissiveIntensity={0.5}
                    metalness={1}
                    roughness={0}
                  />
                </mesh>
              );
            })}
          </>
        )}
      </Float>

      {/* Подсветка снизу */}
      {!isLocked && (
        <pointLight
          position={[0, -2, 0]}
          intensity={0.5}
          color={isSelected ? '#ffd700' : '#667eea'}
        />
      )}
    </group>
  );
};

// Обертка Canvas для премиум аватара
export const Premium3DAvatar: React.FC<Premium3DAvatarProps> = ({ 
  emoji, 
  isSelected = false, 
  isLocked = false,
  size = 100
}) => {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{
          background: isLocked 
            ? 'radial-gradient(circle, rgba(60,60,60,0.2) 0%, transparent 70%)'
            : isSelected 
              ? 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)'
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        <Avatar3D emoji={emoji} isSelected={isSelected} isLocked={isLocked} />
        
        {/* Добавляем окружение для отражений */}
        <Environment preset="city" />
        
        {/* Контролы только если не заблокировано */}
        {!isLocked && (
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}
      </Canvas>

      {/* Эффект свечения */}
      {!isLocked && isSelected && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, transparent 30%, rgba(255,215,0,0.4) 100%)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </div>
  );
};