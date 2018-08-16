var mysql = require("mysql");


var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "password",
    port : "3307",
    database : "bamazon"
});
connection.connect(function(err){
    if(err){
        throw err;
    }
    askAction();
})

function askAction(){
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "Choose an option: ",
        choices: ["View Products for Sale", 
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product"]
    })
    .then(function(response) {
        if(response.options === "View Products for Sale"){
            displayTable(false);
        }
        else if(response.options === "View Low Inventory"){
            displayTable(true);
        }
        else if(response.options === "Add to Inventory"){
            askProduct();
        }
        else if(response.options === "Add New Product"){
            askAddProduct();
        }

    });
}

function handleErr(err){
    console.log(err);
}

function askAddProduct(){
    inquirer.prompt(
        [{
            name: "name",
            message: "Input the product name"
        },
        {
            name: "department",
            type: "list",
            message: "Choose an available department: ",
            choices: ["Office", 
            "Electronics"]
        },
        {
            name: "price",
            message: "Input price of product",
            validate: function(value) {
                var intValue = parseFloat(value);
                if(intValue && intValue > 0){
                    return true;
                }
                else return "Input a valid number amount";
            }
        },
        {
            name: "stock",
            message: "Input stock quantity of product",
            validate: function(value) {
                var intValue = parseInt(value);
                if(intValue && intValue > 0){
                    return true;
                }
                else return "Input a valid number amount";
            }
        }]).then(function(response) {
            insertIntoTable(response.name, response.department, response.price, response.stock);
            
            //console.log("yay");
        });
}
function askProduct(){
    inquirer.prompt(
        [{
            name: "id",
            message: "Input the id of the product to add",
            validate: function(value) {
                var hasID = checkID(parseInt(value));
                return hasID.then(function(result){
                            if(result){
                                return true;
                            }
                            return "Please input a valid ID number";
                        });
            }
        },
        {
            name: "quantity",
            message: "Input how much to add",
            validate: function(value) {
                var intValue = parseInt(value);
                if(Number.isInteger(intValue) && intValue > 0){
                    return true;
                }
                else return "Input a valid number amount";
            }
        }]).then(function(response) {
            var current = checkquantity(response.id);
            current.then(function(result){
                
                //console.log("result" + typeof result);
                //console.log("responsequant" + typeof response.quantity);
                var newAmount = result + parseInt(response.quantity);
                updateTable(response.id, newAmount);
                displayTable(false);
                
            }, handleErr)
            //console.log("Yay");
        });
}
function checkquantity(id){
    return new Promise(function(resolve, reject){
        connection.query(
            "SELECT stock_quantity FROM products WHERE item_id = " + id,
            function(err,res) {
                if(err){
                    reject(err);
                }
                
                resolve(res[0].stock_quantity);
                
            }
        );
    });
}

function checkID(id){
    return new Promise(function(resolve, reject){
        connection.query(
            "SELECT item_id FROM products",
            function(err,res) {
                if(err){
                    reject(err);
                }
                for(var i = 0; i < res.length; i++){
                    if(res[i].item_id === id){
                        resolve(true);
                    }
                }
                resolve(false);
            }
        );
    });
}
function updateTable(id, quantity){
        connection.query("UPDATE products SET ? WHERE ?",
        [{
            stock_quantity : quantity
        }, 
        {
            item_id : id
        }],
        function(err,res){
            if(err){
                throw (err);
            }
            console.log("Table Updated");
            //resolve();
        });
    
}

function displayTable(low){
    var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
    if(low){
        query += " WHERE stock_quantity<5";
    }
    connection.query(query,
    function(err,res){
        if(err){
            throw err;
        }
        console.log("ID |      PRODUCT NAME      | PRICE | STOCK");
        for(var i = 0; i < res.length; i++){
            console.log(res[i].item_id +  "  |  " + res[i].product_name + "  |  " + res[i].price + "  |  " + res[i].stock_quantity);
        }
        console.log("\n\n");
        askAction();
        //connection.end();
    });
}

function insertIntoTable(name, department, price, stock){
    connection.query("INSERT INTO products SET ?",
    {
        product_name : name,
        department_name : department,
        price : price,
        stock_quantity : stock
    }, 
    function(err,res){
        if(err){
            throw err;
        }

        displayTable(false);
        //askAction();
        //displayTable();
    });
}