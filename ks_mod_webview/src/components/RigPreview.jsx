import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function RigPreview({ nodes, edges, selectedNodeId }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const jointsRef = useRef({});
  const bonesRef = useRef({}); // 🆕 store bones

  // ----------------------------
  // INIT
  // ----------------------------
  useEffect(() => {
    if (sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    sceneRef.current = { scene, camera, renderer, controls };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  // ----------------------------
  // BUILD JOINTS (NODES)
  // ----------------------------
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    const { scene } = ctx;

    // remove old joints
    Object.values(jointsRef.current).forEach((m) => scene.remove(m));
    jointsRef.current = {};

    nodes.forEach((node) => {
      const geo = new THREE.SphereGeometry(0.15, 16, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

      const mesh = new THREE.Mesh(geo, mat);

      mesh.userData.id = node.id;

      mesh.position.set(
        node.position.x * 0.01,
        -node.position.y * 0.01,
        0
      );

      scene.add(mesh);
      jointsRef.current[node.id] = mesh;
    });
  }, [nodes]);

  // ----------------------------
  // 🆕 BUILD BONES (EDGES)
  // ----------------------------
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    const { scene } = ctx;

    // remove old bones
    Object.values(bonesRef.current).forEach((line) => scene.remove(line));
    bonesRef.current = {};

    const nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });

    edges.forEach((edge) => {
      const from = nodeMap[edge.source];
      const to = nodeMap[edge.target];

      if (!from || !to) return;

      const points = [
        new THREE.Vector3(
          from.position.x * 0.01,
          -from.position.y * 0.01,
          0
        ),
        new THREE.Vector3(
          to.position.x * 0.01,
          -to.position.y * 0.01,
          0
        )
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2
      });

      const line = new THREE.Line(geometry, material);

      scene.add(line);
      bonesRef.current[edge.id] = line;
    });
  }, [nodes, edges]);

  // ----------------------------
  // SELECTION HIGHLIGHT
  // ----------------------------
  useEffect(() => {
    Object.values(jointsRef.current).forEach((j) =>
      j.material.color.set(0x00ffcc)
    );

    if (selectedNodeId && jointsRef.current[selectedNodeId]) {
      jointsRef.current[selectedNodeId].material.color.set(0xffaa00);
    }
  }, [selectedNodeId]);

  // ----------------------------
  // UPDATE POSITION (Joints only)
  // ----------------------------
  useEffect(() => {
    Object.values(jointsRef.current).forEach((mesh) => {
      const node = nodes.find((n) => n.id === mesh.userData.id);
      if (!node) return;

      mesh.position.set(
        node.position.x * 0.01,
        -node.position.y * 0.01,
        0
      );
    });

    // 🆕 also update bones live
    const ctx = sceneRef.current;
    if (!ctx) return;

    const { scene } = ctx;

    Object.values(bonesRef.current).forEach((line, index) => {
      scene.remove(line);
    });

    bonesRef.current = {};

    const nodeMap = {};
    nodes.forEach((n) => (nodeMap[n.id] = n));

    edges.forEach((edge) => {
      const from = nodeMap[edge.source];
      const to = nodeMap[edge.target];

      if (!from || !to) return;

      const points = [
        new THREE.Vector3(
          from.position.x * 0.01,
          -from.position.y * 0.01,
          0
        ),
        new THREE.Vector3(
          to.position.x * 0.01,
          -to.position.y * 0.01,
          0
        )
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff
      });

      const line = new THREE.Line(geometry, material);

      scene.add(line);
      bonesRef.current[edge.id] = line;
    });
  }, [nodes]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}