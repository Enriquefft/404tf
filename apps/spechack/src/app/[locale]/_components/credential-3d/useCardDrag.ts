import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { Euler, Quaternion } from "three";
import { FLICK_THRESHOLD, FLIP_IMPULSE } from "./constants";

export function useCardDrag(
	rigidBodyRef: React.RefObject<RapierRigidBody | null>,
) {
	const isDragging = useRef(false);
	const lastPointer = useRef({ x: 0, y: 0 });
	const velocity = useRef({ x: 0, y: 0 });
	const lastTime = useRef(0);
	const accRotation = useRef({ x: 0, y: 0 });
	const { gl } = useThree();

	// Use native DOM events on canvas for reliable pointer capture
	const onPointerDown = useCallback(
		(e: PointerEvent) => {
			e.preventDefault();
			gl.domElement.setPointerCapture(e.pointerId);
			isDragging.current = true;
			lastPointer.current = { x: e.clientX, y: e.clientY };
			lastTime.current = performance.now();
			velocity.current = { x: 0, y: 0 };

			// Snapshot current rotation
			const rb = rigidBodyRef.current;
			if (rb) {
				const rot = rb.rotation();
				const euler = new Euler().setFromQuaternion(
					new Quaternion(rot.x, rot.y, rot.z, rot.w),
					"YXZ",
				);
				accRotation.current = { x: euler.x, y: euler.y };
				rb.setBodyType(2, true); // KinematicPositionBased
				rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
				rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
			}
		},
		[rigidBodyRef, gl],
	);

	const onPointerMove = useCallback(
		(e: PointerEvent) => {
			if (!isDragging.current) return;

			const now = performance.now();
			const dt = Math.max(now - lastTime.current, 1);
			const dx = e.clientX - lastPointer.current.x;
			const dy = e.clientY - lastPointer.current.y;

			velocity.current = { x: (dx / dt) * 1000, y: (dy / dt) * 1000 };
			lastPointer.current = { x: e.clientX, y: e.clientY };
			lastTime.current = now;

			// Accumulate rotation from pointer delta
			const sensitivity = 0.006;
			accRotation.current.x += -dy * sensitivity;
			accRotation.current.y += dx * sensitivity;

			// Clamp pitch to avoid gimbal lock
			accRotation.current.x = Math.max(
				-Math.PI / 2,
				Math.min(Math.PI / 2, accRotation.current.x),
			);
		},
		[],
	);

	const onPointerUp = useCallback(
		(e: PointerEvent) => {
			if (!isDragging.current) return;
			isDragging.current = false;
			gl.domElement.releasePointerCapture(e.pointerId);

			const rb = rigidBodyRef.current;
			if (!rb) return;

			rb.setBodyType(0, true); // Dynamic

			const vx = velocity.current.x;
			const vy = velocity.current.y;

			// Horizontal flick detection for flip
			if (Math.abs(vx) > FLICK_THRESHOLD) {
				rb.applyTorqueImpulse(
					{ x: 0, y: Math.sign(vx) * FLIP_IMPULSE, z: 0 },
					true,
				);
			} else if (Math.abs(vx) > 50 || Math.abs(vy) > 50) {
				// Apply torque from swipe velocity
				rb.applyTorqueImpulse(
					{ x: -vy * 0.003, y: vx * 0.003, z: 0 },
					true,
				);
			}
		},
		[rigidBodyRef, gl],
	);

	// Apply accumulated rotation each frame during drag
	useFrame(() => {
		if (!isDragging.current) return;
		const rb = rigidBodyRef.current;
		if (!rb) return;

		const quat = new Quaternion().setFromEuler(
			new Euler(accRotation.current.x, accRotation.current.y, 0, "YXZ"),
		);
		rb.setNextKinematicRotation(quat);
	});

	// Attach/detach native DOM listeners
	const bind = useCallback(() => {
		const canvas = gl.domElement;
		canvas.addEventListener("pointerdown", onPointerDown);
		canvas.addEventListener("pointermove", onPointerMove);
		canvas.addEventListener("pointerup", onPointerUp);
		canvas.addEventListener("pointercancel", onPointerUp);
		return () => {
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerup", onPointerUp);
			canvas.removeEventListener("pointercancel", onPointerUp);
		};
	}, [gl, onPointerDown, onPointerMove, onPointerUp]);

	return {
		bind,
		isDragging,
	};
}
