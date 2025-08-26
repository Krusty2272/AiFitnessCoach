import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Torus, Cone, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Simple3DAvatarProps {
  type: string;
  isSelected?: boolean;
  isLocked?: boolean;
  size?: number;
}

// Различные 3D формы для премиум аватарок
const Avatar3DShape: React.FC<{ 
  type: string; 
  isSelected: boolean; 
  isLocked: boolean 
}> = ({ type, isSelected, isLocked }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Анимация
  useFrame((state) => {
    if (groupRef.current) {
      if (!isLocked) {
        groupRef.current.rotation.y += 0.01;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      }
      
      if (isSelected && meshRef.current) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  // Выбираем форму в зависимости от типа
  const renderShape = () => {
    const material = (
      <meshPhysicalMaterial
        color={isLocked ? '#666666' : isSelected ? '#ffd700' : '#667eea'}
        metalness={isLocked ? 0.2 : 0.9}
        roughness={isLocked ? 0.8 : 0.1}
        clearcoat={isLocked ? 0 : 1}
        clearcoatRoughness={0}
        reflectivity={isLocked ? 0 : 1}
        emissive={isSelected ? '#ffd700' : '#000000'}
        emissiveIntensity={isSelected ? 0.2 : 0}
      />
    );

    switch(type) {
      case 'champion':
        return (
          <>
            {/* Трофей */}
            <mesh ref={meshRef} position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
              {material}
            </mesh>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.6, 0.4, 0.3, 8]} />
              {material}
            </mesh>
            <mesh position={[-0.7, 0.5, 0]}>
              <torusGeometry args={[0.2, 0.05, 8, 16]} />
              {material}
            </mesh>
            <mesh position={[0.7, 0.5, 0]}>
              <torusGeometry args={[0.2, 0.05, 8, 16]} />
              {material}
            </mesh>
          </>
        );
      
      case 'diamond':
        return (
          <mesh ref={meshRef}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color={isLocked ? '#666666' : '#00ffff'}
              metalness={1}
              roughness={0}
              transmission={isLocked ? 0 : 0.9}
              ior={2.4}
              thickness={0.5}
              emissive={isSelected ? '#00ffff' : '#000000'}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </mesh>
        );

      case 'crown':
        return (
          <>
            {/* Корона */}
            <mesh ref={meshRef}>
              <cylinderGeometry args={[0.8, 0.8, 0.3, 8]} />
              {material}
            </mesh>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <mesh key={i} position={[
                  Math.cos(angle) * 0.7, 
                  0.4, 
                  Math.sin(angle) * 0.7
                ]}>
                  <coneGeometry args={[0.15, 0.4, 4]} />
                  {material}
                </mesh>
              );
            })}
          </>
        );

      case 'star':
        return (
          <mesh ref={meshRef}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color={isLocked ? '#666666' : '#ffd700'}
              metalness={1}
              roughness={0}
              emissive={isSelected ? '#ffd700' : '#ffaa00'}
              emissiveIntensity={isLocked ? 0 : 0.5}
            />
          </mesh>
        );

      case 'lightning':
        return (
          <>
            {/* Молния */}
            <mesh ref={meshRef} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.3, 1.5, 0.3]} />
              <meshPhysicalMaterial
                color={isLocked ? '#666666' : '#ffff00'}
                emissive={isLocked ? '#000000' : '#ffff00'}
                emissiveIntensity={isLocked ? 0 : 0.8}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0.3, -0.3, 0]} rotation={[0, 0, -0.4]}>
              <boxGeometry args={[0.3, 1, 0.3]} />
              <meshPhysicalMaterial
                color={isLocked ? '#666666' : '#ffff00'}
                emissive={isLocked ? '#000000' : '#ffff00'}
                emissiveIntensity={isLocked ? 0 : 0.8}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          </>
        );

      case 'phoenix':
        return (
          <>
            {/* Феникс (упрощенный) */}
            <mesh ref={meshRef}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshPhysicalMaterial
                color={isLocked ? '#666666' : '#ff4500'}
                emissive={isLocked ? '#000000' : '#ff0000'}
                emissiveIntensity={isLocked ? 0 : 0.6}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            {/* Крылья */}
            <mesh position={[-1, 0, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.5, 1.5, 4]} />
              <meshPhysicalMaterial
                color={isLocked ? '#666666' : '#ff6500'}
                emissive={isLocked ? '#000000' : '#ff4500'}
                emissiveIntensity={isLocked ? 0 : 0.4}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[1, 0, 0]} rotation={[0, 0, 0.3]}>
              <coneGeometry args={[0.5, 1.5, 4]} />
              <meshPhysicalMaterial
                color={isLocked ? '#666666' : '#ff6500'}
                emissive={isLocked ? '#000000' : '#ff4500'}
                emissiveIntensity={isLocked ? 0 : 0.4}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          </>
        );

      default:
        return (
          <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            {material}
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {renderShape()}
      
      {/* Золотое кольцо для разблокированных */}
      {!isLocked && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 100]} />
          <meshPhysicalMaterial
            color="#ffd700"
            metalness={1}
            roughness={0}
            emissive="#ffd700"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      {/* Замок для заблокированных */}
      {isLocked && (
        <group position={[0, 0, 1]}>
          <Text
            fontSize={0.5}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
          >
            🔒
          </Text>
        </group>
      )}

      {/* Частицы вокруг */}
      {!isLocked && isSelected && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle + Date.now() * 0.001) * 2,
                  Math.sin(Date.now() * 0.002 + i) * 0.5,
                  Math.sin(angle + Date.now() * 0.001) * 2
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#ffd700" />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

export const Simple3DAvatar: React.FC<Simple3DAvatarProps> = ({ 
  type, 
  isSelected = false, 
  isLocked = false,
  size = 100
}) => {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{
          background: isLocked 
            ? 'radial-gradient(circle at center, rgba(40,40,40,0.8) 0%, rgba(20,20,20,0.9) 100%)'
            : isSelected 
              ? 'radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.1) 100%)'
              : 'radial-gradient(circle at center, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.1) 100%)'
        }}
      >
        <ambientLight intensity={isLocked ? 0.3 : 0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={isLocked ? 0.5 : 1} 
          castShadow 
        />
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={0.2} 
          color={isSelected ? '#ffd700' : '#667eea'}
        />
        
        {!isLocked && (
          <pointLight
            position={[0, 0, 2]}
            intensity={0.5}
            color={isSelected ? '#ffd700' : '#ffffff'}
          />
        )}
        
        <Avatar3DShape type={type} isSelected={isSelected} isLocked={isLocked} />
        
        {!isLocked && (
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            autoRotate={!isSelected}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}
      </Canvas>

      {/* Эффекты */}
      {!isLocked && isSelected && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 30px rgba(255,215,0,0.5)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
      
      {isLocked && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
          }}
        />
      )}
    </div>
  );
};