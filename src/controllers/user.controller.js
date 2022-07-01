const users = [
{
    "id": 0,
    "firstName": "John",
    "lastName": "Doe",
    "street": "Lovensdijkstraat 61",
    "city": "Breda",
    "isActive": true,
    "emailAdress": "j.doe@server.com",
    "password": "secret",
    "phoneNumber": "06 12425475"
},
{
    "id": 1,
    "firstName": "Piet",
    "lastName": "Puck",
    "street": "Jippie Straat",
    "city": "Breda",
    "isActive": true,
    "emailAdress": "p.puck@server.com",
    "password": "secret",
    "phoneNumber": "06 12425475"
}
];

function ValidateEmail(inputText) {
    console.log(inputText);
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(inputText.value.match(mailformat)) {
        return false;
    }
    else {return true;}
}

function checkExistingUser(inputEmail) {
    users.forEach(item => {
        if (item.emailAdress == inputEmail) {
            console.log("Email Bestond al");
            console.log(item.emailAdress);
            console.log(inputEmail);
            return true;
        } else {
            console.log("Email Bestond nog niet");
            return false;
        }
    });
}

function findByID(id) {
    users.forEach(item => {
        if (item.id == id) {
            return item;
        } else {return false;}
    });
}


let controller = {
    allUsers(req,res) {
        console.log("alsjeblieft");
        res.status(200).json({users});
    },

    newUser(req,res) {
        let newUser = req.body;
        let password = req.body.password;
        console.log(newUser);
        if (newUser.firstName == null || newUser.lastName == null || newUser.street == null || newUser.city == null || newUser.emailAdress == null || newUser.password == null) {
            console.log("Veld ontbreekt");
            res.status(400).json({message: "Verplicht veld ontbreekt"});
        } else if (password.length < 5) {
            console.log("Password te kort");
            res.status(400).json({message: "Wachtwoord is fout"});
        } else if (!newUser.emailAdress.includes("@")) {
            console.log("Emailadres is fout");
            res.status(400).json({message: "Email Adress is fout"});
        } else if (checkExistingUser(newUser.emailAdress)) {
            console.log("Emailadres bestaat al if");
            res.status(409).json({message: "Gebruiker bestaat al"});
        } else {
            console.log("Ik voeg een user toe");
            let addedNewUser = {
                "id": 5,
                "firstName": newUser.firstName,
                "lastName": newUser.lastName,
                "street": newUser.street,
                "city": newUser.city,
                "isActive": true,
                "emailAdress": newUser.emailAdress,
                "password": newUser.password,
                "phoneNumber": newUser.phoneNumber
            }
            users.push(addedNewUser);
            res.status(201).json(addedNewUser);
        }
    }
};

module.exports = controller;