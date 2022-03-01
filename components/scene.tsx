import React, { useCallback, useMemo, useRef, useState } from "react";
import { Engine, Scene as ReactScene } from "react-babylonjs";
import { HuePicker } from "react-color";
import NextImage from "next/image";

import {
  Box,
  Button,
  Collapse,
  FormLabel,
  HStack,
  Stack,
  Switch,
  Wrap,
} from "@chakra-ui/react";
import {
  AbstractMesh,
  Color3,
  HighlightLayer,
  Mesh,
  Scene,
  Texture,
} from "@babylonjs/core";

import { RenderModel } from "./render";

const textures = [
  "seat__1.jpg",
  "seat__2.jpg",
  "seat__3.jpg",
  "seat__4.jpg",
  "wood__1.jpg",
  "wood__2.jpg",
  "wood__3.jpg",
];

const modelFolder = "bt";

const ModelScene = () => {
  const [groupName, setGroupName] = useState<string>();
  const [clickedMesh, setClickedMesh] = useState<AbstractMesh>();
  const [scene, setScene] = useState<Scene>();
  const highlightLayerEL = useRef<HighlightLayer>(null);
  const [color, setColor] = useState<string>();
  const [isGroupSelect, setIsGroupSelect] = useState(false);

  const selectedMeshes = useMemo(() => {
    const sceneMeshes = scene?.meshes.filter((m) => m.metadata);
    const selected =
      sceneMeshes && clickedMesh
        ? isGroupSelect
          ? sceneMeshes.filter((m) => m.name.includes(`${groupName}`))
          : sceneMeshes.filter((m) => m.name === clickedMesh.name)
        : [];

    scene?.meshes.forEach((m) =>
      highlightLayerEL.current?.removeMesh(m as Mesh)
    );
    selected.forEach((s) =>
      highlightLayerEL.current?.addMesh(s as Mesh, Color3.White())
    );

    return selected;
  }, [isGroupSelect, scene, groupName, clickedMesh]);

  const handleColorChange = useCallback(
    (color: string) => {
      setColor(color);
      selectedMeshes.forEach((mesh) => {
        const color3 = Color3.FromHexString(color);
        (mesh.material as any).albedoColor = color3;
      });
    },
    [selectedMeshes]
  );

  const onSelectTexture = (path: string) => {
    const texture = new Texture(path, scene as Scene);

    selectedMeshes.forEach((mesh) => {
      (mesh.material as any).albedoTexture = texture;
      (mesh.material as any).albedoTexture.uScale = 3;
      (mesh.material as any).albedoTexture.vScale = 3;
    });
  };

  const onLoaded = (scene: Scene) => {
    setScene(scene);
  };

  const onClickMesh = (mesh: AbstractMesh) => {
    const [meshGroupName] = mesh.name.split("__");
    setGroupName(meshGroupName);
    setClickedMesh(mesh);
  };

  return (
    <Box w="100vw" h="100vh">
      <Stack
        as={Collapse}
        in={selectedMeshes.length > 0}
        pos="fixed"
        bottom={4}
        left={4}
        right={4}
        justify="center"
        spacing={4}
      >
        <HStack justify="center">
          <Button
            colorScheme="blackAlpha"
            onClick={() => handleColorChange('#ffffff')}
          >
            Reset Color
          </Button>
          <HStack
          cursor='pointer'
            align="center"
            bg={isGroupSelect ? "green.500" : "blackAlpha.500"}
            rounded="lg"
            p={2}
            color="white"
          >
            <Switch
              display='none'
              id="select"
              colorScheme="blue"
              checked={isGroupSelect}
              onChange={(e) => setIsGroupSelect(e.target.checked)}
            />
            <FormLabel htmlFor="select">Select groups</FormLabel>
          </HStack>
        </HStack>

        <HStack justify="center">
          <HuePicker
            color={color}
            onChange={(color) => handleColorChange(color.hex)}
          />
        </HStack>
        <Wrap justify="center">
          {textures.map((t) => (
            <Box
              onClick={() => onSelectTexture(`/models/${modelFolder}/${t}`)}
              rounded="full"
              key={t}
              overflow="hidden"
              boxSize={16}
            >
              <NextImage
                alt="image"
                width="100%"
                height="100%"
                layout="intrinsic"
                src={`/models/${modelFolder}/${t}`}
                objectFit="cover"
                quality={20}
              />
            </Box>
          ))}
        </Wrap>
      </Stack>
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
          <highlightLayer name="highlight" ref={highlightLayerEL} />
          <RenderModel rootUrl={`/models/${modelFolder}/`} />
        </ReactScene>
      </Engine>
    </Box>
  );
};

export default ModelScene;
