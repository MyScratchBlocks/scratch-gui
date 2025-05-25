const username = localStorage.getItem('username');

 const generateRandomUsername = () => {
   if (username === "") {
     const DIGITS = 4;
     const randomNumber = Math.round(Math.random() * (10 ** DIGITS));
     const randomId = randomNumber.toString().padStart(DIGITS, '0');
     const randomUsername = `MyScratchBlocks-Coder-${randomId}`;
     return randomUsername;
    } else {
       const randomUsername = `${username}`
       return randomUsername;
   }
 }
    

export {
    generateRandomUsername
};
