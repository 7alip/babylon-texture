import React, { useRef, FC, Suspense } from "react";
import {
  ILoadedModel,
  Model,
  SceneLoaderContextProvider,
  useScene,
} from "react-babylonjs";
import {
  Vector3,
  Color3,
  ArcRotateCamera,
  Nullable,
  FramingBehavior,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export type RenderModelProps = {
  rootUrl: string;
};

export const RenderModel: FC<RenderModelProps> = ({ rootUrl }) => {
  const camera = useRef<Nullable<ArcRotateCamera>>(null);
  const scene = useScene();

  const onModelLoaded = (e: ILoadedModel) => {
    if (camera?.current) {
      camera.current.useFramingBehavior = true;
      const framingBehavior = camera.current.getBehaviorByName(
        "Framing"
      ) as FramingBehavior;
      framingBehavior.framingTime = 0;
      framingBehavior.elevationReturnTime = -1;

      if (e.rootMesh) {
        camera.current.lowerRadiusLimit = null;

        const worldExtends = scene!.getWorldExtends((sceneMesh) => {
          const includeMesh = (e.meshes as AbstractMesh[]).some(
            (loadedMesh: AbstractMesh) => loadedMesh === sceneMesh
          );

          return includeMesh;
        });

        framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
      } else {
        console.warn("no root mesh");
      }

      camera.current.pinchPrecision = 200 / camera.current.radius;
      camera.current.upperRadiusLimit = 5 * camera.current.radius;
    }
  };

  return (
    <SceneLoaderContextProvider>
      <Suspense fallback={null}>
        <arcRotateCamera
          ref={camera}
          name="arc"
          target={Vector3.Zero()}
          position={Vector3.Zero()}
          alpha={1}
          beta={1}
          minZ={0.0001}
          wheelPrecision={50}
          useAutoRotationBehavior
          allowUpsideDown={false}
          checkCollisions
          radius={2}
          lowerRadiusLimit={25}
          upperRadiusLimit={75}
          useFramingBehavior={true}
          wheelDeltaPercentage={0.3}
          pinchDeltaPercentage={0.3}
        />

        <environmentHelper
          options={{
            enableGroundShadow: false,
            createGround: false,
            skyboxSize: 1000,
            skyboxColor: Color3.White(),
          }}
          setMainColor={[Color3.White()]}
        />
        <hemisphericLight
          name="light"
          direction={new Vector3(0, 1, 1)}
          intensity={1}
        />
        <Model
          name="model"
          key="model"
          reportProgress
          position={Vector3.Zero()}
          rootUrl={rootUrl}
          sceneFilename="model.glb"
          rotation={Vector3.Zero()}
          onModelLoaded={onModelLoaded}
        />
      </Suspense>
    </SceneLoaderContextProvider>
  );
};
