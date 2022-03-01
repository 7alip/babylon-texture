import React, { useRef, FC } from "react";
import { ILoadedModel, useScene } from "react-babylonjs";
import {
  Vector3,
  Color3,
  ArcRotateCamera,
  Nullable,
  FramingBehavior,
  Texture,
} from "@babylonjs/core";
import { ScaledModelWithProgress } from "./scaled-model-with-progress";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Box, Image } from "@chakra-ui/react";

export type RenderModelProps = {
  sceneFilename: string;
  setTextures: (textures: string[]) => void;
};

export const RenderModel: FC<RenderModelProps> = ({
  sceneFilename,
  setTextures,
}) => {
  const camera = useRef<Nullable<ArcRotateCamera>>(null);
  const scene = useScene();

  console.log("scene filename rendered:", sceneFilename);

  const onModelLoaded = (e: ILoadedModel) => {
    if (camera && camera.current) {
      // if (e.loaderName === "gltf") {
      //   camera.current.alpha += Math.PI;
      // }

      const textures = scene!.textures
        .filter((texture) => texture.metadata)
        .map((texture) => {
          const buffer = (texture as any)._buffer as Uint8Array;
          const byte = new Uint8Array(buffer);
          const blob = new Blob([byte.buffer]);
          console.log("blob", blob);
          const url = URL.createObjectURL(blob);
          console.log("url", url);
          return url;
        });
      console.log("textures", textures);
      setTextures(textures as string[]);

      // Enable camera's behaviors (done declaratively)
      camera.current.useFramingBehavior = true;
      var framingBehavior = camera.current.getBehaviorByName(
        "Framing"
      ) as FramingBehavior;
      framingBehavior.framingTime = 0;
      framingBehavior.elevationReturnTime = -1;

      if (e.rootMesh) {
        camera.current.lowerRadiusLimit = null;

        var worldExtends = scene!.getWorldExtends((sceneMesh) => {
          const includeMesh = (e.meshes as AbstractMesh[]).some(
            (loadedMesh: AbstractMesh) => loadedMesh === sceneMesh
          );

          // if (includeMesh === true) {
          //   console.log(`including: '${mesh.name}'`)
          // }

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
    <>
      <arcRotateCamera
        ref={camera}
        name="arc"
        target={Vector3.Zero()}
        position={Vector3.Zero()}
        alpha={Math.PI}
        beta={0.5 + Math.PI / 4}
        minZ={0.001}
        wheelPrecision={50}
        useAutoRotationBehavior
        allowUpsideDown={false}
        checkCollisions
        radius={2}
        lowerRadiusLimit={25}
        upperRadiusLimit={75}
        useFramingBehavior={true}
        wheelDeltaPercentage={0.01}
        pinchDeltaPercentage={0.01}
      />

      <environmentHelper
        options={{
          enableGroundShadow: false,
          createGround: false,
          skyboxSize: 1000,
        }}
        setMainColor={[Color3.FromHexString("#ffffff")]}
      />

      <ScaledModelWithProgress
        rootUrl="/"
        sceneFilename={sceneFilename}
        progressBarColor={Color3.FromInts(135, 206, 235)}
        center={Vector3.Zero()}
        modelRotation={Vector3.Zero()}
        onModelLoaded={(e: ILoadedModel) => {
          onModelLoaded(e);
        }}
      />
    </>
  );
};
