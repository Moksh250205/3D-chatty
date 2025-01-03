import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { useGraph } from '@react-three/fiber';
import { OrbitControls, useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useControls, folder, button } from 'leva';
import { AnimationContext } from '../context/AnimationContext';

const animationExpressions = {
  Walking: {
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browInnerUp: 0.1,
    browOuterUpLeft: 0.05,
    browOuterUpRight: 0.05,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Idle: {
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    browInnerUp: 0.1,
    browOuterUpLeft: 0.05,
    browOuterUpRight: 0.05,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
    eyeWideLeft: 0.2,
    eyeWideRight: 0.2,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Angry: {
    mouthSmileLeft: -0.3,       // Negative smile (frown) left side
    mouthSmileRight: -0.3,      // Negative smile (frown) right side
    mouthFrownLeft: 0.3,        // Slight frown left side
    mouthFrownRight: 0.3,       // Slight frown right side
    eyeWideLeft: -0.3,          // Smaller eye left side
    eyeWideRight: -0.3,         // Smaller eye right side
    browOuterUpLeft: 0.3,          // Left side of right eye goes down
    browOuterUpRight: 0.3,
  },
  SillyDance: {
    mouthSmileLeft: 1.0,
    mouthSmileRight: 1.0,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    cheekSquintLeft: 0.5,
    cheekSquintRight: 0.5,
    browInnerUp: 0.2,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  SoulSpin: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    browInnerUp: 0.3,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  StandingGreeting: {
    mouthClose:-0.15, 
    mouthSmileLeft: 0.3,
    mouthSmileRight: 0.3,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browInnerUp: 0.3,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  FlyingKiss: {
    mouthPucker: 1.0,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    browInnerUp: 0.3,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Clap: {
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    eyeBlinkLeft: 1.45,
    eyeBlinkRight: 1.45,
    eyeWideLeft: 0.3,
    eyeWideRight: 0.3,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
    browInnerUp: 0.0,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Bashful: {
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    eyeSquintLeft: 0.6,
    eyeBlinkLeft: 0.45,
    eyeBlinkRight: 0.45,
    eyeSquintRight: 0.6,
    cheekSquintLeft: 0.3,
    cheekSquintRight: 0.3,
    browInnerUp: 0.0,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  BellyDance: {
    mouthClose:-0.15, 
    mouthSmileLeft: 0.4,
    mouthSmileRight: 0.4,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    browInnerUp: 0.0,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Kiss: {
    mouthPucker: 1.0,
    eyeSquintLeft: 0.7,
    eyeSquintRight: 0.7,
    browInnerUp: 0.3,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Moonwalk: {
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    eyeWideLeft: 0.4,
    eyeWideRight: 0.4,
    browOuterUpLeft: 0.3,
    browOuterUpRight: 0.3,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
    eyeSquintLeft: 0.0,
    eyeSquintRight: 0.0,
  },
  Thinking: {
    browInnerUp: 0.7,
    eyeLookUpLeft: 0.5,
    eyeLookUpRight: 0.5,
    mouthPucker: 0.3,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Singing: {
    jawOpen: 0.15,
    mouthFunnel: 0.5,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browInnerUp: 0.0,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  },
  Agreeing: {
    mouthSmileLeft: 0.5,
    mouthSmileRight: 0.5,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
    browInnerUp: 0.2,
    browOuterUpLeft: 0.0,
    browOuterUpRight: 0.0,
    eyeWideLeft: 0.0,
    eyeWideRight: 0.0,
    cheekSquintLeft: 0.0,
    cheekSquintRight: 0.0,
    noseSneerLeft: 0.0,
    noseSneerRight: 0.0,
  }, 
  Upset: {
    mouthSmileLeft: -0.3,       // Negative smile (frown) left side
    mouthSmileRight: -0.3,     // Negative smile (frown) right side
    mouthFrownLeft: 0.3,        // Slight frown left side
    mouthFrownRight: 0.3,       // Slight frown right side
    eyeWideLeft: -0.5,          // Smaller eye left side
    eyeWideRight: -0.5,         // Smaller eye right side
    browOuterUpLeft: -0.4,          // Left side of right eye goes down
    browOuterUpRight: -0.4,
  },
};


const morphCategories = {
  'Eyes Left': [
    'eyeBlinkLeft',
    'eyeLookDownLeft',
    'eyeLookInLeft',
    'eyeLookOutLeft',
    'eyeLookUpLeft',
    'eyeSquintLeft',
    'eyeWideLeft',
  ],
  'Eyes Right': [
    'eyeBlinkRight',
    'eyeLookDownRight',
    'eyeLookInRight',
    'eyeLookOutRight',
    'eyeLookUpRight',
    'eyeSquintRight',
    'eyeWideRight',
  ],
  'Jaw': [
    'jawForward',
    'jawLeft',
    'jawRight',
    'jawOpen',
  ],
  'Mouth': [
    'mouthClose',
    'mouthFunnel',
    'mouthPucker',
    'mouthLeft',
    'mouthRight',
    'mouthSmileLeft',
    'mouthSmileRight',
    'mouthFrownLeft',
    'mouthFrownRight',
    'mouthDimpleLeft',
    'mouthDimpleRight',
    'mouthStretchLeft',
    'mouthStretchRight',
    'mouthRollLower',
    'mouthRollUpper',
    'mouthShrugLower',
    'mouthShrugUpper',
    'mouthPressLeft',
    'mouthPressRight',
    'mouthLowerDownLeft',
    'mouthLowerDownRight',
    'mouthUpperUpLeft',
    'mouthUpperUpRight',
  ],
  'Brows': [
    'browDownLeft',
    'browDownRight',
    'browInnerUp',
    'browOuterUpLeft',
    'browOuterUpRight',
  ],
  'Cheeks': [
    'cheekPuff',
    'cheekSquintLeft',
    'cheekSquintRight',
    'noseSneerLeft',
    'noseSneerRight',
  ],
  'Other': [
    'tongueOut',
  ],
};

export function Avatar(props) {
  const { scene } = useGLTF('/model1.glb');
  const clone = useMemo(() => {
    const cloneSkeleton = SkeletonUtils.clone(scene);
    return cloneSkeleton;
  }, [scene]);
  const { nodes, materials } = useGraph(clone);

  const idleFBX = useMemo(() => useFBX('/Idle.fbx'), []);
  const angryFBX = useMemo(() => useFBX('/Angry.fbx'), []);
  const sillyFBX = useMemo(() => useFBX('/Silly Dancing.fbx'), []);
  const soulSpinFBX = useMemo(() => useFBX('/Northern Soul Spin Combo.fbx'), []);
  const greetFBX = useMemo(() => useFBX('/Standing Greeting.fbx'), []);
  const FlyingKissFBX = useMemo(() => useFBX('/Flying Kiss.fbx'), []);
  const clapFBX = useMemo(() => useFBX('/Clapping.fbx'), []);
  const bashfulFBX = useMemo(() => useFBX('/Bashful.fbx'), []);
  const bellyDanceFBX = useMemo(() => useFBX('/Bellydancing.fbx'), []);
  const kissFBX = useMemo(() => useFBX('/Kiss.fbx'), []);
  const moonwalkFBX = useMemo(() => useFBX('/Moonwalk.fbx'), []);
  const thinkingFBX = useMemo(() => useFBX('/Thinking.fbx'), []);
  const singingFBX = useMemo(() => useFBX('/Singing.fbx'), []);
  const agreeingFBX = useMemo(() => useFBX('/Agreeing.fbx'), []);
  const walkingFBX = useMemo(() => useFBX('/Walking.fbx'), []); 
  const upsetFBX = useMemo(() => useFBX('/Idle1.fbx'), []); 

  idleFBX.animations[0].name = 'Idle';
  angryFBX.animations[0].name = 'Angry';
  sillyFBX.animations[0].name = 'SillyDance';
  soulSpinFBX.animations[0].name = 'SoulSpin';
  greetFBX.animations[0].name = 'StandingGreeting';
  FlyingKissFBX.animations[0].name = 'FlyingKiss';
  clapFBX.animations[0].name = 'Clap';
  bashfulFBX.animations[0].name = 'Bashful';
  bellyDanceFBX.animations[0].name = 'BellyDance';
  kissFBX.animations[0].name = 'Kiss';
  moonwalkFBX.animations[0].name = 'Moonwalk';
  thinkingFBX.animations[0].name = 'Thinking';
  singingFBX.animations[0].name = 'Singing';
  agreeingFBX.animations[0].name = 'Agreeing';
  walkingFBX.animations[0].name = 'Walking'; 
  upsetFBX.animations[0].name = 'Upset'; 

  const [animation, setAnimation] = useContext(AnimationContext);
  const [cameraZ, setCameraZ] = useState(1);
  const group = useRef();
  const head = useRef();

  const { actions } = useAnimations(
    [
      idleFBX.animations[0],
      angryFBX.animations[0],
      sillyFBX.animations[0],
      soulSpinFBX.animations[0],
      greetFBX.animations[0],
      FlyingKissFBX.animations[0],
      clapFBX.animations[0],
      bashfulFBX.animations[0],
      bellyDanceFBX.animations[0],
      kissFBX.animations[0],
      moonwalkFBX.animations[0],
      thinkingFBX.animations[0],
      singingFBX.animations[0],
      agreeingFBX.animations[0],
      walkingFBX.animations[0], 
      upsetFBX.animations[0] 
    ],
    group
  );

  const createMorphControlsSchema = (categoryName, morphTargets) => {
    const controls = {};
    morphTargets.forEach(targetName => {
      controls[targetName] = {
        value: 0,
        min: -2,
        max: 2,
        step: 0.01,
      };
    });
    
    return {
      [categoryName]: folder({
        ...controls,
        [`reset${categoryName.replace(/\s+/g, '')}`]: button(() => {
          morphTargets.forEach(targetName => {
            const index = nodes.Wolf3D_Head.morphTargetDictionary[targetName];
            if (index !== undefined) {
              nodes.Wolf3D_Head.morphTargetInfluences[index] = 0;
            }
          });
        })
      })
    };
  };

  const applyExpression = (expressionName) => {
    const expression = animationExpressions[expressionName];
    if (!expression) return;

    const previousValues = nodes.Wolf3D_Head.morphTargetInfluences.slice();
    
    const targetValues = new Array(nodes.Wolf3D_Head.morphTargetInfluences.length).fill(0);
    
    Object.entries(expression).forEach(([targetName, value]) => {
      const index = nodes.Wolf3D_Head.morphTargetDictionary[targetName];
      if (index !== undefined) {
        targetValues[index] = value;
      }
    });

    gsap.to(nodes.Wolf3D_Head.morphTargetInfluences, {
      duration: 0.5,
      ease: "power2.inOut",
      ...targetValues.reduce((acc, target, index) => {
        acc[index] = target;
        return acc;
      }, {})
    });
  };

  // const morphControls = useControls('Facial Expressions', {
  //   ...Object.entries(morphCategories).reduce((acc, [category, morphs]) => ({
  //     ...acc,
  //     ...createMorphControlsSchema(category, morphs)
  //   }), {}),
  //   resetAll: button(() => {
  //     if (nodes.Wolf3D_Head?.morphTargetInfluences) {
  //       nodes.Wolf3D_Head.morphTargetInfluences.fill(0);
  //     }
  //   }),
  //   expressions: folder({
  //     ...Object.keys(animationExpressions).reduce((acc, animName) => ({
  //       ...acc,
  //       [animName]: button(() => applyExpression(animName))
  //     }), {})
  //   })
  // });

  // useEffect(() => {
  //   if (nodes.Wolf3D_Head?.morphTargetDictionary) {
  //     Object.entries(nodes.Wolf3D_Head.morphTargetDictionary).forEach(([targetName, index]) => {
  //       if (morphControls[targetName] !== undefined) {
  //         gsap.to(nodes.Wolf3D_Head.morphTargetInfluences, {
  //           [index]: morphControls[targetName],
  //           duration: 0.3,
  //           ease: "power2.inOut"
  //         });
  //       }
  //     });
  //   }
  // }, [morphControls, nodes.Wolf3D_Head]);

  

  useEffect(() => {
    if (actions && actions[animation.name]) {
      const nextAction = actions[animation.name];
      nextAction.reset().play();

      if (group.current) {
        // animation.name === 'Walking' ? -0.9 : 
        group.current.position.set(0, -0.8, cameraZ);
        group.current.rotation.set(
          animation.name === 'Idle' ? -Math.PI/2 : -Math.PI / 2 + 0.1,
          0,
          animation.name === 'Moonwalk' ? -1.5 : 0
        );
      }

      applyExpression(animation.name);
    }
  }, [animation, actions]);

  useGSAP(() => {
    if (animation.name === 'Idle' || animation.name === 'StandingGreeting') {
      gsap.to(group.current.position, {
        x: 0,
        z: 4,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setCameraZ(4);
        }
      });
    } else if (animation.name === 'Kiss') {
      gsap.to(group.current.position, {
        x: 0,
        z: 4.2,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setCameraZ(4.2);
        }
      });
    }else if(animation.name === 'Walking'){
      gsap.to(group.current.position, {
        x: 0,
        z: 3.3,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setCameraZ(3.3);
        }
      });
    }

    else if (animation.name === 'Moonwalk') {
      gsap.to(group.current.position, {
        x: 0,
        z: 1.5,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setCameraZ(1.5);
        }
      });
    } else {
      gsap.to(group.current.position, {
        x: 0,
        z: 3,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setCameraZ(3);
        }
      });
    }
  });
  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Headwear.geometry}
        material={materials.Wolf3D_Headwear}
        skeleton={nodes.Wolf3D_Headwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        ref={head}
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload('/model1.glb');
useFBX.preload('/Idle.fbx');
useFBX.preload('/Angry.fbx');
useFBX.preload('/Silly Dancing.fbx');
useFBX.preload('/Northern Soul Spin Combo.fbx');
useFBX.preload('/Standing Greeting.fbx');
useFBX.preload('/Flying Kiss.fbx');
useFBX.preload('/Clapping.fbx');
useFBX.preload('/Bashful.fbx');
useFBX.preload('/Bellydancing.fbx');
useFBX.preload('/Kiss.fbx');
useFBX.preload('/Moonwalk.fbx');
useFBX.preload('/Thinking.fbx');
useFBX.preload('/Singing.fbx');
useFBX.preload('/Agreeing.fbx');