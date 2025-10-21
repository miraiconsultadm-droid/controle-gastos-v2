CREATE TABLE `movimentacoes` (
	`id` varchar(64) NOT NULL,
	`data` date NOT NULL,
	`rubrica` varchar(255) NOT NULL,
	`banco` varchar(255),
	`pagador` varchar(255),
	`valor` decimal(12,2) NOT NULL,
	`cod_rubrica` varchar(64),
	`descricao` text,
	`parcelas` int DEFAULT 1,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `movimentacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rubricas` (
	`id` varchar(64) NOT NULL,
	`codigo` varchar(64) NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`tipo` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `rubricas_id` PRIMARY KEY(`id`)
);
