import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function RigPreview({ nodes, edges }) {
    const mountRef = useRef(null);

    useEffect(() => {
        // scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderTarget({ antialias: true });
        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );

        mountRef.current.appendChild(renderer.domElement);

        // Lights
        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        // Rig build (TEMP VISUAL)
        const jointMeshes = {};
        nodes.forEach((node) => {
            const geo = new THREE.SphereGeometry(0.1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
            const mesh = new THREE.Mesh(geo, mat);

            mesh.position.set(
                node.position.x * 0.01,
                node.position.y * 0.01,
                0
            );
            scene.add(mesh);
            jointMeshes[node.id] = mesh;
        });

        // bones (lines)
        edges.forEach((edge) => {
            const from = jointMeshes[edge.source];
            const to = jointMeshes[edge.target];

            if (!from || !to) return;

            const geometry = new THREE.BufferGeometry().setFromPoints([
                from.position,
                to.position
            ]);
        })
    })
}