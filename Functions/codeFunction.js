const Code = require("../Models/CodeSchema");

async function isUserPremium(userId) {
  const codes = await Code.findOne({
    "redeemedBy.id": userId.toString(),
  });

  // Check if codes is truthy and has a length property
  return codes && codes.length > 0;
}

module.exports = { isUserPremium };
