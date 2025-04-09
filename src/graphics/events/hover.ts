import * as THREE from 'three'

import { InstancedMeshId, ModelId } from '../../types'

export class HoverEventHandler {
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()

  constructor(
    private camera: THREE.Camera,
    private scene: THREE.Scene,
    private renderer: THREE.WebGLRenderer,
    private onHover: (modelId: ModelId, instancedMeshId: InstancedMeshId, instancedMeshInstanceIndex: number) => void,
  ) {
    this.renderer.domElement.addEventListener('pointermove', this.onMouseMove)
  }

  private onMouseMove = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    if (intersects.length > 0) {
      const intersection = intersects[0]

      if (!(intersection.object instanceof THREE.InstancedMesh)) return
      if (!('isPartOfThreeJs' in intersection.object.userData && intersection.object.userData['isPartOfThreeJs'] === true)) return
      if (!(intersection.object.parent instanceof THREE.Group)) return
      if (!('isPartOfThreeJs' in intersection.object.parent.userData && intersection.object.parent.userData['isPartOfThreeJs'] === true)) return

      if ('instancedMeshId' in intersection.object.userData && 'modelId' in intersection.object.parent.userData && intersection.instanceId) {
        const instancedMeshId: InstancedMeshId = intersection.object.userData['instancedMeshId']
        const modelId: ModelId = intersection.object.parent.userData['modelId']
        this.onHover(modelId, instancedMeshId, intersection.instanceId)
      }
    }
  }

  dispose() {
    this.renderer.domElement.removeEventListener('pointermove', this.onMouseMove)
  }
}
