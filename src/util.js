const sanitizeData = (data) => {
  // Only quadruped models will be allowed.
  let sanitizedList = [];
  if (data && data.length > 0) {
    // Get only required attributes from JSON Payload
    const filteredList = data
      .filter((it) => it.type.startsWith("quadruped"))
      .map(({ name, searchName, type, thumbnails, scale, model }) => ({
        name,
        searchName,
        type,
        thumbnails,
        scale,
        model,
      }));
    // Discard the models that are not rigged or do not have thumbnails
    filteredList.forEach((perModel) => {
      if (checkForValidModel(perModel)) {
        generalizeScaleInfo(perModel);
        sanitizedList.push(perModel);
      }
    });
    // Sorted models in ascending order of scale
    sanitizedList.sort((model1, model2) => model1.gen_scale - model2.gen_scale);
    // Remove extra key from payload
    sanitizedList = sanitizedList.map(
      ({ gen_scale, ...keepAttrs }) => keepAttrs
    );
  }
  return sanitizedList;
};

function checkForValidModel(model) {
  return (
    model.hasOwnProperty("thumbnails") &&
    model["thumbnails"] &&
    model.hasOwnProperty("scale") &&
    model["scale"] &&
    model["model"].hasOwnProperty("rig") &&
    model["model"]["rig"].hasOwnProperty("rigged_model_fbx") &&
    model["model"]["rig"]["rigged_model_fbx"]
  );
}

function generalizeScaleInfo(model) {
  if (model["scale"].hasOwnProperty("length")) {
    model.gen_scale = model["scale"]["length"];
  } else if (model["scale"].hasOwnProperty("height")) {
    model.gen_scale = model["scale"]["height"];
  } else if (model["scale"].hasOwnProperty("width")) {
    model.gen_scale = model["scale"]["width"];
  } else {
    model.gen_scale = 0;
  }
}

const utils = {
  sanitizeData,
};

module.exports = utils;
