import type { ThreeEvent } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useCallback, useRef } from "react";
import { FLICK_THRESHOLD, FLIP_IMPULSE } from "./constants";

export function useCardDrag(
	rigidBodyRef: React.RefObject<RapierRigidBody | null>,
) {
	const isDragging = useRef(false);
	const lastPointer = useRef({ x: 0, y: 0 });
	const velocity = useRef({ x: 0, y: 0 });
	const lastTime = useRef(0);

	const onPointerDown = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
			isDragging.current = true;
			lastPointer.current = { x: e.clientX, y: e.clientY };
			lastTime.current = performance.now();
			velocity.current = { x: 0, y: 0 };

			const rb = rigidBodyRef.current;
			if (rb) {
				rb.setBodyType(2, true); // KinematicPositionBased
			}
		},
		[rigidBodyRef],
	);

	const onPointerMove = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (!isDragging.current) return;

			const now = performance.now();
			const dt = Math.max(now - lastTime.current, 1);
			const dx = e.clientX - lastPointer.current.x;
			const dy = e.clientY - lastPointer.current.y;

			velocity.current = { x: dx / dt, y: dy / dt };
			lastPointer.current = { x: e.clientX, y: e.clientY };
			lastTime.current = now;

			const rb = rigidBodyRef.current;
			if (rb) {
				const rot = rb.rotation();
				// Apply rotation from pointer delta
				const sensitivity = 0.005;
				rb.setNextKinematicRotation({
					x: rot.x + dy * sensitivity,
					y: rot.y + dx * sensitivity,
					z: rot.z,
					w: rot.w,
				});
			}
		},
		[rigidBodyRef],
	);

	const onPointerUp = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (!isDragging.current) return;
			isDragging.current = false;

			const rb = rigidBodyRef.current;
			if (!rb) return;

			rb.setBodyType(0, true); // Dynamic

			const vx = velocity.current.x;
			const vy = velocity.current.y;

			// Horizontal flick detection for flip
			if (Math.abs(vx) > FLICK_THRESHOLD / 1000) {
				rb.applyTorqueImpulse(
					{ x: 0, y: Math.sign(vx) * FLIP_IMPULSE, z: 0 },
					true,
				);
			} else {
				// Apply gentle torque from swipe velocity
				rb.applyTorqueImpulse({ x: -vy * 2, y: vx * 2, z: 0 }, true);
			}
		},
		[rigidBodyRef],
	);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		isDragging,
	};
}
