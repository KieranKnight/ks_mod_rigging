import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function RigPreview({ nodes = [] }) {
  const mountRef = useRef(null);

  const nodeMapRef = useRef({});
  const boneMapRef = useRef([]);

  const selectedRef = useRef(null);

  useEffect(() => {
    // ----------------------------
    // SCENE
    // ----------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // ----------------------------
    // ORBIT CONTROLS (ALWAYS ON)
    // ----------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // ----------------------------
    // LIGHT
    // ----------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // ----------------------------
    // UPDATE BONES
    // ----------------------------
    const updateBones = () => {
      boneMapRef.current.forEach(({ parent, child, line }) => {
        parent.updateWorldMatrix(true, false);
        child.updateWorldMatrix(true, false);

        const p = new THREE.Vector3();
        const c = new THREE.Vector3();

        parent.getWorldPosition(p);
        child.getWorldPosition(c);

        const pos = line.geometry.attributes.position.array;

        pos[0] = p.x;
        pos[1] = p.y;
        pos[2] = p.z;

        pos[3] = c.x;
        pos[4] = c.y;
        pos[5] = c.z;

        line.geometry.attributes.position.needsUpdate = true;
      });
    };

    // ----------------------------
    // ANIMATE LOOP
    // ----------------------------
    const animate = () => {
      requestAnimationFrame(animate);

      updateBones();
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // ----------------------------
    // RAYCASTER (selection only)
    // ----------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersections = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const meshes = Object.values(nodeMapRef.current).map(
        (g) => g.userData.mesh
      );

      return raycaster.intersectObjects(meshes);
    };

    // ----------------------------
    // CLICK SELECT JOINT
    // ----------------------------
    const onMouseDown = (e) => {
      const hits = getIntersections(e);
      if (!hits.length) {
        selectedRef.current = null;
        return;
      }

      const mesh = hits[0].object;
      selectedRef.current = mesh.parent; // group
    };

    // ----------------------------
    // DRAG ROTATION (FK)
    // ----------------------------
    const onMouseMove = (e) => {
      if (!selectedRef.current || e.buttons !== 1) return;

      selectedRef.current.rotation.y += e.movementX * 0.01;
      selectedRef.current.rotation.x += e.movementY * 0.01;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // ----------------------------
    // BUILD RIG
    // ----------------------------
    const buildRig = () => {
      nodeMapRef.current = {};
      boneMapRef.current = [];

      // JOINTS
      nodes.forEach((node) => {
        const group = new THREE.Group();

        group.position.set(
          node.position.x * 0.005,
          -node.position.y * 0.005,
          0
        );

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.15),
          new THREE.MeshStandardMaterial({ color: 0x00ffcc })
        );

        group.add(mesh);
        scene.add(group);

        // store mesh reference for raycasting
        group.userData.mesh = mesh;

        nodeMapRef.current[node.id] = group;
      });

      // PARENTING + BONES
      nodes.forEach((node) => {
        if (!node.parent) return;

        const parent = nodeMapRef.current[node.parent];
        const child = nodeMapRef.current[node.id];

        if (!parent || !child) return;

        parent.add(child);

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3()
        ]);

        const material = new THREE.LineBasicMaterial({
          color: 0xffffff
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        boneMapRef.current.push({
          parent,
          child,
          line
        });
      });
    };

    buildRig();

    // ----------------------------
    // CLEANUP
    // ----------------------------
    return () => {
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);

      controls.dispose();
      renderer.dispose();
    };
  }, [nodes]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    />
  );
}