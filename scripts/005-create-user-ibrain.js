import bcrypt from "bcryptjs";

const password = "Cruz2005";
const hash = bcrypt.hashSync(password, 10);
console.log("Hash:", hash);
