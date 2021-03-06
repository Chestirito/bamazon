var mysql = require("mysql");

var Table = require('easy-table');
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
    //updateTable();
    //insertIntoTable();
    displayTable();
    //connection.end();
})

function askProduct(){
    inquirer.prompt(
    [{
        name: "id",
        message: "Input the id of the product you wish to buy",
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
        message: "How many would you like to buy?",
        validate: function(value) {
            var intValue = parseInt(value);
            if(intValue && intValue > 0){
                return true;
            }
            else return "Input a valid number amount";
        }
    }]).then(function(response) {
        //console.log(checkquantity(response.id, response.quantity));
        var isEnough = checkquantity(response.id, response.quantity);
        isEnough.then(function(result){
            if(result){
                //console.log(typeof result);
                var newAmount = result - response.quantity;
                //return {id : response.id, amount: newAmount};
                updateTable(response.id, newAmount);
                showTotal(response.id, response.quantity);
                displayTable();
            }else{
                console.log("\nNot enough items in stock, please try again\n");
                askProduct();
            }
        }, handleErr)
    });
}

function handleErr(err){
    console.log(err);
}

function checkquantity(id, quantity){
    return new Promise(function(resolve, reject){
        connection.query(
            "SELECT stock_quantity FROM products WHERE item_id = " + id,
            function(err,res) {
                if(err){
                    reject(err);
                }
                if(res[0].stock_quantity < parseInt(quantity)){
                    resolve(false);
                }
                else{
                    resolve(res[0].stock_quantity);
                }
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
function showTotal(id,boughtAmt){
        connection.query(
            "SELECT price FROM products WHERE item_id = " + id,
            function(err,res) {
                if(err){
                    throw(err);
                }
                var totalPrice = res[0].price * boughtAmt;
                console.log("\n----------------------------------------------------------------")
                console.log("Your total for the purchase was: $" + totalPrice.toFixed(2));
                console.log("----------------------------------------------------------------\n")
            }
        );
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
            console.log("\nTable Updated");
            //resolve();
        });
    
}

function displayTable(){
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
    function(err,res){
        if(err){
            throw err;
        }
        var t = new Table;

        res.forEach(function(item) {
            t.cell('ID', item.item_id);
            t.cell('Product Name', item.product_name);
            t.cell('Price', item.price);
            t.cell('Stock', item.stock_quantity);
            t.newRow();
        });
        /*console.log("ID |      PRODUCT NAME      | PRICE | STOCK");
        for(var i = 0; i < res.length; i++){
            console.log(res[i].item_id +  "  |  " + res[i].product_name + "  |  " + res[i].price + "  |  " + res[i].stock_quantity);
        }*/
        console.log(t.toString());
        askProduct();
        //connection.end();
    });
}
