const generateRandomUsername = () => {
  let username = localStorage.getItem('username');
  
  if (username && username !== "") {
    return username;
  } else {
    const DIGITS = 4;
    const randomNumber = Math.floor(Math.random() * (10 ** DIGITS));
    const randomId = randomNumber.toString().padStart(DIGITS, '0');
    const randomUsername = `MyScratchBlocks-${randomId}`;
    
    localStorage.setItem('username', randomUsername);
    
    return randomUsername;
  }
};

export {
  generateRandomUsername
};
