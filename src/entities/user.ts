import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @CreateDateColumn() // Preenche automaticamente com a data/hora atual no momento da criação
    created_at: Date;

    constructor(id: number, username: string, password: string, created_at: Date) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.created_at = created_at;
    }
}
