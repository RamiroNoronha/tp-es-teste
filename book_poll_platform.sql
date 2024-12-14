CREATE DATABASE book_poll_platform;
USE book_poll_platform;

CREATE TABLE users (
id INT auto_increment primary key,
username varchar(50) not null unique,
password varchar(255) not null,
created_at timestamp default current_timestamp
);

create table poll_types(
id int auto_increment primary key,
type_name varchar(50) not null
);

create table polls (
id int auto_increment primary key,
title varchar(255) not null,
description text,
poll_type_id int,
user_id int,
created_at timestamp default current_timestamp,
closed_at timestamp null,
foreign key (poll_type_id) references poll_types(id),
foreign key (user_id) references users(id)
); 

create table poll_options(
id int auto_increment primary key,
poll_id int,
option_text varchar(255) not null,
foreign key (poll_id) references polls(id)
);

create table votes(
id int auto_increment primary key,
poll_id int,
option_id int,
user_id int,
created_at timestamp default current_timestamp,
foreign key (poll_id) references polls(id),
foreign key (option_id) references poll_options(id),
foreign key (user_id) references users(id),
unique (poll_id, user_id)
);

INSERT INTO poll_types (type_name) VALUES ('multiple_choice'), ('single_choice'), ('open_response');

insert into users (username, password) values ('teste1', 'teste1'), ('teste2', 'teste2');
select * from users;




