import React, { ChangeEvent, useRef, useState } from "react";
import { Engine, Scene as ReactScene } from "react-babylonjs";

import { Box, Image, Stack, Wrap } from "@chakra-ui/react";
import {
  AbstractMesh,
  Color3,
  HighlightLayer,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

import { RenderModel } from "./render";

const textures = ["/diamond.jpg", "leather.jpg", "rug.jpg"]

const App = () => {
  const [sceneFilename, setSceneFilename] = useState("bt.glb");
  const [images, setImages] = useState<string[]>([]);
  const [selectedMeshes, setSelectedMeshes] = useState<AbstractMesh[]>([]);
  const [scene, setScene] = useState<Scene>();
  const highlightLayerEL = useRef<HighlightLayer>(null);
  console.log('images', images)

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // https://github.com/BabylonJS/Babylon.js/blob/master/sandbox/src/components/renderingZone.tsx#L148
    // TODO: engine.clearInternalTexturesCache();
    setSceneFilename(event.target.value);
  };

  const onSelectTexture = (path: string) => {
    const texture = new Texture(path, scene as Scene);
    console.log("selectedMeshes", selectedMeshes);

    console.log("texture", texture.name);
    selectedMeshes.forEach((mesh) => {
      const material = scene?.materials.find(
        (m) => mesh.material?.id === m.id
      ) as StandardMaterial;

      // material.ambientTexture = texture;
      material.diffuseTexture = texture;
      // material.emissiveTexture = texture;
      // material.specularTexture = texture;
      // material.reflectionTexture = texture;
      // material.refractionTexture = texture;
      (material as any).albedoTexture = texture;
      (material as any).albedoTexture.uScale = 2;
      (material as any).albedoTexture.vScale = 2;
    });
  };

  const onLoaded = (scene: Scene) => {
    setScene(scene);
  };

  const onClickMesh = (mesh: AbstractMesh, scene: Scene) => {
    const [meshTNodeName] = mesh.name.split("__");

    const meshes = scene.meshes
      .filter((m) => m.metadata)
      .filter((m) => {
        if (m.name.includes(`${meshTNodeName}`)) {
          highlightLayerEL.current?.addMesh(m as Mesh, Color3.White());
          return true;
        } else {
          highlightLayerEL.current?.removeMesh(m as Mesh);
          return false;
        }
      });

    setSelectedMeshes(meshes);
  };

  console.log('s', images.concat(textures))

  return (
    <>
      {/* <Box pos="absolute" top={4} right={4}>
        <Select defaultValue={sceneFilename} onChange={handleChange}>
          {models.map((model) => (
            <option key={model.name} value={model.filename}>
              {model.name}
            </option>
          ))}
        </Select>
      </Box> */}
      <Box w="100vw" h="100vh">
        {images?.length > 0 && selectedMeshes.length > 0 && (
          <Stack pos="fixed" top={4} left={4} right={4}>
            <Wrap justify="center">
              {images.concat(textures).map((t) => {
                console.log("t", t);
                return (
                  <Image
                    onClick={() => onSelectTexture(t)}
                    boxSize={16}
                    rounded="full"
                    objectFit="cover"
                    key={t}
                    src={t}
                  />
                );
              })}
            </Wrap>
          </Stack>
        )}
        <Engine
          antialias
          adaptToDeviceRatio
          engineOptions={{
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            antialias: true,
          }}
          canvasStyle={{ width: "100%", height: "100%" }}
        >
          <ReactScene
            onDataLoadedObservable={onLoaded}
            onMeshPicked={onClickMesh}
          >
            <hemisphericLight
              name="light"
              direction={new Vector3(0, 1, 1)}
              intensity={0.6}
            />
            <highlightLayer name="highlight" ref={highlightLayerEL} />
            <RenderModel
              sceneFilename={sceneFilename}
              setTextures={setImages}
            />
          </ReactScene>
        </Engine>
      </Box>
    </>
  );
};

export default App;
