import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type ModelView = 'iso' | 'front' | 'top';
export interface GlbViewer {
	setView(view: ModelView): void;
	setUpper(visible: boolean): void;
	reset(): void;
	dispose(): void;
}

/** Rendering is event-driven: no continuous animation loop or automatic rotation. */
export function createGlbViewer(
	host: HTMLDivElement,
	url: string,
	title: string,
	onReady: (upperAvailable: boolean) => void,
	onError: () => void
): GlbViewer {
	const mobile = matchMedia('(max-width: 767px), (pointer: coarse)').matches;
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: !mobile,
		powerPreference: 'low-power'
	});
	renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.5));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.shadowMap.enabled = !mobile;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	const canvas = renderer.domElement;
	canvas.style.cssText = 'display:block;width:100%;height:100%;outline-offset:-3px';
	canvas.tabIndex = 0;
	canvas.setAttribute('role', 'img');
	canvas.setAttribute(
		'aria-label',
		`3D-модель: ${title}. Вращение — мышью, пальцем или стрелками. Масштаб — колесом, жестом или клавишами плюс и минус.`
	);
	host.append(canvas);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(37, 1, 0.01, 1000);
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = false;
	controls.enablePan = false;
	controls.maxPolarAngle = Math.PI / 2;
	const hemi = new THREE.HemisphereLight(0xffffff, 0x879789, 1.7);
	const key = new THREE.DirectionalLight(0xfff3dd, 2.8);
	const fill = new THREE.DirectionalLight(0xe3efff, 1.5);
	key.castShadow = !mobile;
	key.shadow.mapSize.set(1024, 1024);
	key.shadow.bias = -0.0002;
	key.shadow.normalBias = 0.012;
	scene.add(hemi, key, fill, key.target, fill.target);
	let disposed = false,
		visible = true,
		ready = false,
		raf = 0;
	let root: THREE.Group | undefined;
	let radius = 1,
		distance = 6;
	const upper: THREE.Object3D[] = [];
	const abort = new AbortController();
	const timeout = window.setTimeout(() => {
		abort.abort();
		if (!disposed) onError();
	}, 60000);
	function render() {
		if (disposed || !visible || document.hidden || !ready || raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			if (!disposed && visible && !document.hidden && ready) renderer.render(scene, camera);
		});
	}
	function visibility() {
		controls.enabled = visible && !document.hidden;
		if (!controls.enabled && raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
		render();
	}
	const observer = new IntersectionObserver((entries) => {
		visible = entries[0]?.isIntersecting ?? false;
		visibility();
	});
	observer.observe(host);
	document.addEventListener('visibilitychange', visibility);
	controls.addEventListener('change', render);
	function fit() {
		const width = Math.max(1, host.clientWidth),
			height = Math.max(1, host.clientHeight);
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
		const halfAngle = Math.min(vertical, Math.atan(Math.tan(vertical) * camera.aspect));
		const next = (radius / Math.sin(halfAngle)) * 1.08;
		if (ready && distance)
			camera.position
				.sub(controls.target)
				.multiplyScalar(next / distance)
				.add(controls.target);
		distance = next;
		controls.minDistance = radius * 0.6;
		controls.maxDistance = distance * 3;
		camera.near = Math.max(radius / 1000, 0.001);
		camera.far = distance * 10;
		camera.updateProjectionMatrix();
		controls.update();
		render();
	}
	const resize = new ResizeObserver(fit);
	resize.observe(host);
	function setView(view: ModelView) {
		const theta = view === 'iso' ? 0.35 : 0;
		const phi = view === 'top' ? 0.01 : view === 'front' ? Math.PI / 2 : 1.1;
		camera.position.setFromSphericalCoords(distance, phi, theta).add(controls.target);
		camera.lookAt(controls.target);
		controls.update();
		render();
	}
	function setUpper(show: boolean) {
		upper.forEach((node) => {
			node.visible = show;
		});
		render();
	}
	function reset() {
		setUpper(true);
		setView('iso');
	}
	function keyboard(event: KeyboardEvent) {
		if (!controls.enabled || !ready) return;
		const position = camera.position.clone().sub(controls.target);
		const spherical = new THREE.Spherical().setFromVector3(position);
		if (event.key === 'ArrowLeft') spherical.theta -= 0.1;
		else if (event.key === 'ArrowRight') spherical.theta += 0.1;
		else if (event.key === 'ArrowUp') spherical.phi = Math.max(0.01, spherical.phi - 0.1);
		else if (event.key === 'ArrowDown') spherical.phi = Math.min(Math.PI / 2, spherical.phi + 0.1);
		else if (event.key === '+' || event.key === '=')
			spherical.radius = Math.max(controls.minDistance, spherical.radius * 0.9);
		else if (event.key === '-')
			spherical.radius = Math.min(controls.maxDistance, spherical.radius / 0.9);
		else return;
		event.preventDefault();
		camera.position.setFromSpherical(spherical).add(controls.target);
		controls.update();
		render();
	}
	canvas.addEventListener('keydown', keyboard);
	function contextLost(event: Event) {
		event.preventDefault();
		if (!disposed) onError();
	}
	canvas.addEventListener('webglcontextlost', contextLost);
	function disposeScene(group: THREE.Object3D) {
		const textures = new Set<THREE.Texture>(),
			materials = new Set<THREE.Material>();
		group.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				object.geometry.dispose();
				for (const material of Array.isArray(object.material)
					? object.material
					: [object.material]) {
					materials.add(material);
					for (const value of Object.values(material))
						if (value instanceof THREE.Texture) textures.add(value);
				}
			}
		});
		textures.forEach((texture) => {
			const image = texture.image;
			if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
			texture.dispose();
		});
		materials.forEach((material) => material.dispose());
	}
	// Read a bounded, automatically HTTP-decompressed response and disallow external model resources.
	void (async () => {
		const response = await fetch(url, { signal: abort.signal, credentials: 'omit' });
		if (!response.ok || !response.body) throw new Error('Model unavailable');
		const reader = response.body.getReader();
		const chunks: Uint8Array[] = [];
		let length = 0;
		try {
			while (true) {
				const chunk = await reader.read();
				if (chunk.done) break;
				length += chunk.value.byteLength;
				if (length > 25 * 1024 * 1024) throw new Error('Model too large');
				chunks.push(chunk.value);
			}
		} finally {
			await reader.cancel();
			reader.releaseLock();
		}
		if (disposed) return;
		const buffer = new Uint8Array(length);
		let offset = 0;
		chunks.forEach((chunk) => {
			buffer.set(chunk, offset);
			offset += chunk.length;
		});
		const manager = new THREE.LoadingManager();
		manager.setURLModifier((resource) => {
			if (!resource.startsWith('blob:') && !resource.startsWith('data:'))
				throw new Error('External resources forbidden');
			return resource;
		});
		const gltf = await new GLTFLoader(manager).parseAsync(buffer.buffer, '');
		if (disposed) {
			disposeScene(gltf.scene);
			return;
		}
		root = gltf.scene;
		const box = new THREE.Box3().setFromObject(root);
		const center = box.getCenter(new THREE.Vector3()),
			size = box.getSize(new THREE.Vector3());
		if (box.isEmpty() || !Number.isFinite(size.length()) || size.length() === 0)
			throw new Error('Empty scene');
		root.position.sub(center);
		radius = size.length() / 2;
		root.traverse((object) => {
			if (
				/Upper|extractor|Blue[ _]goblet|Cooking[ _]pot|Pot[ _]/i.test(object.name) ||
				object.userData.legetGroup === 'upper'
			)
				upper.push(object);
			if (object instanceof THREE.Mesh) {
				object.castShadow = !mobile;
				object.receiveShadow = !mobile;
			}
		});
		scene.add(root);
		key.position.set(-radius * 2, radius * 3, radius * 3);
		fill.position.set(radius * 3, radius * 2, radius);
		Object.assign(key.shadow.camera, {
			left: -radius * 2,
			right: radius * 2,
			top: radius * 2,
			bottom: -radius * 2,
			near: 0.01,
			far: radius * 12
		});
		key.shadow.camera.updateProjectionMatrix();
		if (!mobile) {
			const floor = new THREE.Mesh(
				new THREE.PlaneGeometry(radius * 8, radius * 8),
				new THREE.ShadowMaterial({ opacity: 0.16 })
			);
			floor.rotation.x = -Math.PI / 2;
			floor.position.y = -size.y / 2 - 0.01;
			floor.receiveShadow = true;
			scene.add(floor);
		}
		ready = true;
		fit();
		reset();
		clearTimeout(timeout);
		onReady(upper.length > 0);
		render();
	})().catch(() => {
		clearTimeout(timeout);
		if (!disposed) onError();
	});
	return {
		setView,
		setUpper,
		reset,
		dispose() {
			if (disposed) return;
			disposed = true;
			clearTimeout(timeout);
			abort.abort();
			cancelAnimationFrame(raf);
			observer.disconnect();
			resize.disconnect();
			document.removeEventListener('visibilitychange', visibility);
			canvas.removeEventListener('keydown', keyboard);
			canvas.removeEventListener('webglcontextlost', contextLost);
			controls.dispose();
			disposeScene(scene);
			key.shadow.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			canvas.remove();
		}
	};
}
