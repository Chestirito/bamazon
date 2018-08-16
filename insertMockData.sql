USE bamazon;

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ("Wireless Mouse", "Electronics", 4.99, 248), 
("Stapler", "Office", 7.99, 127),
("100 Paper Clips Box", "Office", 0.99, 87),
("Blueray DVD Player", "Electronics", 87.99, 28),
("Intel i7 Labtop", "Electronics", 997.67, 5),
("Samson Smartphone S11+", "Electronics", 895.78, 26),
("4k UHD Smart TV 50inch", "Electronics", 465.88, 6),
("1000 White Printer Paper", "Office", 9.99, 168),
("Box of 50 Pens", "Office", 7.99, 89),
("5000 Staples", "Office", 7.87, 245);

select * from products;