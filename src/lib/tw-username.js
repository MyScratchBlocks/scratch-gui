const generateRandomUsername = () => {
  let username = window.parent.username;
  
  if (username && username !== "") {
    return username;
  } else {
    const DIGITS = 4;
    const randomNumber = Math.floor(Math.random() * (10 ** DIGITS));
    const randomId = randomNumber.toString().padStart(DIGITS, '0');
    const randomUsername = `SnapLabs-${randomId}`;   
    return randomUsername;
  }
};

export {
  generateRandomUsername
};
