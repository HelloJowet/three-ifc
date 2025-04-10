import * as THREE from 'three'

import { InstancedMeshId, MeshInstanceReference, ModelId } from '../../types'

export class ClickEventHandler {
  static handle = (
    event: MouseEvent,
    camera: THREE.Camera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    onClickObject: (meshInstanceReference: MeshInstanceReference) => void,
    onClickEmpty: () => void,
  ) => {
    const rect = renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    if (intersects.length === 0) {
      // If no object was clicked, trigger onClickEmpty
      onClickEmpty()
      return
    }
    const intersection = intersects[0]

    if (
      intersection.object.type === 'Mesh' &&
      'isPartOfThreeJs' in intersection.object.userData &&
      intersection.object.userData['isPartOfThreeJs'] === true &&
      intersection.object.parent?.type === 'Group' &&
      'isPartOfThreeJs' in intersection.object.parent.userData &&
      intersection.object.parent.userData['isPartOfThreeJs'] === true &&
      'instancedMeshId' in intersection.object.userData &&
      'modelId' in intersection.object.parent.userData &&
      intersection.instanceId != undefined
    ) {
      const instancedMeshId: InstancedMeshId = intersection.object.userData['instancedMeshId']
      const modelId: ModelId = intersection.object.parent.userData['modelId']
      onClickObject({ modelId, instancedMeshId, instancedMeshInstanceIndex: intersection.instanceId })
    } else onClickEmpty()
  }
}
