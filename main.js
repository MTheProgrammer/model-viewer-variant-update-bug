import "./style.css";

/**
 * Variants are used to store PBR materials parameters, but textures are loaded dynamically.
 * This is necessary to avoid duplicating materials when only its color changes, e.g. sofa textile.
 *
 * The reason why materialName starts with a prefix `body_` instead of a full material name
 * is because we need to resolve the active material for the current variant before updating its textures.
 */
const materialConfigs = [
    {
        id: "mat-1",
        variant: "shiny",
        materialName: 'body_',
        texture: 'TexturesCom_Brick_BlocksPainted_Clean_512',
        label: "Blue&Shiny"
    },
    {
        id: "mat-2",
        variant: "rough",
        materialName: 'body_',
        texture: 'TexturesCom_Brick_Rustic2_512',
        label: "Rustic&Rough"
    },
    {
        id: "mat-3",
        variant: "rough",
        materialName: 'body_',
        texture: 'TexturesCom_Brick_BlocksPainted_Yellow_512',
        label: "Yellow&Rough"
    },
];

async function createAndApplyTexture(modelViewer, material, channel, textureName) {
    const texture = await modelViewer.createTexture(textureName);
    if (channel.includes('base') || channel.includes('metallic')) {
        material.pbrMetallicRoughness[channel].setTexture(texture);
    } else {
        material[channel].setTexture(texture);
    }
}

function findActiveMaterial(modelViewer, modelMaterialName) {
    return modelViewer.model.materials.find((material) => {
        const {isActive, name} = material;
        if (isActive && name.startsWith(modelMaterialName)) {
            return material;
        }

        return null;
    })
}

const texturesPath = 'textures/';

async function updateMaterials(materialConfig) {
    const {texture, materialName, variant} = materialConfig;

    const materialTexturesUrl = texturesPath + texture;
    const albedoTexture = materialTexturesUrl + "_albedo.png";
    const normalTexture = materialTexturesUrl + "_normal.png";
    const metallicRoughnessTexture = materialTexturesUrl + "_roughness.png";
    const occlusionTexture = materialTexturesUrl + "_ao.png";

    /** Bug:
     * this line executes asynchronously, active material is not updated on time in findActiveMaterial
     */
    // modelViewer.variantName = variant;
    /** Correct behavior:
     * Promise correctly updates active material assigned to the variant and resolved in the findActiveMaterial.
     */
    await Promise.resolve(() => modelViewer.variantName = variant);

    const material = findActiveMaterial(modelViewer, materialName);

    await Promise.all(
        [
            createAndApplyTexture(modelViewer, material, 'baseColorTexture', albedoTexture),
            createAndApplyTexture(modelViewer, material, 'normalTexture', normalTexture),
            createAndApplyTexture(modelViewer, material, 'metallicRoughnessTexture', metallicRoughnessTexture),
            createAndApplyTexture(modelViewer, material, 'occlusionTexture', occlusionTexture),
        ]
    );
}

const onTextureChange = async (e) => {
    const materialId = e.target.value;
    const materialConfig = materialConfigs.find(entry => {
            const {id} = entry;
            if (id === materialId) {
                return entry;
            }
            return null;
        }
    );

    if (!materialConfig) {
        throw new Error(`Material config with id ${materialId} does not exist`);
    }

    await updateMaterials(materialConfig);
}
const modelViewer = document.getElementById("model");
const ui = document.getElementById("ui");
ui.innerHTML = `
<label for="textures-select">Texture</label>
<select id="textures-select">
    <option id="" value="">Select an option</option>
  ${materialConfigs.map((option) => (
    `<option id="${option.id}" value="${option.id}">
      ${option.label}
    </option>`
))}
</select>
`

document.getElementById('textures-select')
    .addEventListener('change', onTextureChange)
