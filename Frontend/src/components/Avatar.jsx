import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { useGraph } from '@react-three/fiber';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useControls } from 'leva';
import { AnimationContext } from '../context/AnimationContext';

const animationMorphTargetsValue = {
  Idle: {
    mouthOpen: 0.4,
    mouthSmile: 0.51, 
    teeth:{
      mouthOpen: -0.71,
      mouthSmile: 0
    }
  },
  Upset: {
    mouthOpen: -0.71, 
    mouthSmile: -0.61, 
    teeth:{
      mouthOpen: 0,
      mouthSmile: 0, 
    }
  },
  StandingGreeting:{

  }
};

export function Avatar(props) {
  const { scene } = useGLTF('/../src/assets/model.glb');
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

  idleFBX.animations[0].name = 'Idle';
  angryFBX.animations[0].name = 'Angry';
  sillyFBX.animations[0].name = 'SillyDance';
  greetFBX.animations[0].name = 'StandingGreeting';
  FlyingKissFBX.animations[0].name = 'FlyingKiss';
  clapFBX.animations[0].name = 'Clap';
  bashfulFBX.animations[0].name = 'Bashful';
  bellyDanceFBX.animations[0].name = 'BellyDance';
  kissFBX.animations[0].name = 'Kiss';
  moonwalkFBX.animations[0].name = 'Moonwalk';
  thinkingFBX.animations[0].name = 'Thinking';
  singingFBX.animations[0].name = 'Singing';
  soulSpinFBX.animations[0].name = 'SoulSpin';
  agreeingFBX.animations[0].name = 'Agreeing';

  const [animation, setAnimation] = useContext(AnimationContext);
  const [cameraZ, setCameraZ] = useState(5);

  const headMorphTargets = nodes.Wolf3D_Head.morphTargetDictionary;
  const headInfluences = nodes.Wolf3D_Head.morphTargetInfluences;

  const teethMorphTargets = nodes.Wolf3D_Teeth.morphTargetDictionary;
  const teethInfluences = nodes.Wolf3D_Teeth.morphTargetInfluences;

  const teethMorphControls = useControls(
    'Teeth Morph Targets', 
    Object.keys(teethMorphTargets).reduce((controls, key) => {
      controls[key] = { value: 0, min: -1, max: 1, step: 0.01 };
      return controls;
    }, {})
  );

  useEffect(() => {
    Object.keys(teethMorphControls).forEach((key) => {
      const index = teethMorphTargets[key];
      if (index !== undefined) {
        teethInfluences[index] = teethMorphControls[key];
      }
    });
  }, [teethMorphControls, teethMorphTargets, teethInfluences]);

  const morphControls = useControls(
    'Morph Targets', 
    Object.keys(headMorphTargets).reduce((controls, key) => {
      controls[key] = { value: 0, min: -1, max: 1, step: 0.01 };
      return controls;
    }, {})
  );

  useEffect(() => {
    Object.keys(morphControls).forEach((key) => {
      const index = headMorphTargets[key];
      if (index !== undefined) {
        headInfluences[index] = morphControls[key];
      }
    });
  }, [morphControls, headMorphTargets, headInfluences]);

  const group = useRef();
  const head = useRef();
  const { actions } = useAnimations(
    [idleFBX.animations[0],
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
    agreeingFBX.animations[0]],
    group
  );

  useEffect(() => {
    if (actions && actions[animation.name]) {
      const nextAction = actions[animation.name];

      nextAction.reset().play();

      if (group.current) {
        group.current.position.set(0, -0.8, cameraZ);
        group.current.rotation.set(animation.name === 'Idle' ? -Math.PI/2 : -Math.PI / 2 + 0.1, 0, 0);
      }

      if (animation.name === 'Idle') {
        const mouthOpenIndex = headMorphTargets.mouthOpen;
        const mouthSmileIndex = headMorphTargets.mouthSmile;

        if (mouthOpenIndex !== undefined) {
          headInfluences[mouthOpenIndex] = animationMorphTargetsValue.Idle.mouthOpen;
        }
        if (mouthSmileIndex !== undefined) {
          headInfluences[mouthSmileIndex] = animationMorphTargetsValue.Idle.mouthSmile;
        }
      }

      if (animation.name === 'Moonwalk') {
        group.current.rotation.set(-Math.PI / 2 + 0.1, 0, -1.5);
      }

    } else {
      console.warn(`Action for animation "${animation.name}" not found.`);
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
    } else if (animation.name === 'Moonwalk') {
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

useGLTF.preload('/../src/assets/model.glb');
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
