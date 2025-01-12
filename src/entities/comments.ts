import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user';
import { Polls } from './poll';

@Entity()
export class Comments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poll_id: number;

    @Column()
    user_id: number;

    @Column()
    content: string;

    @Column()
    created_at: Date;

    constructor(id: number, poll_id: number, user_id: number, content: string, created_at: Date) {
        this.id = id;
        this.poll_id = poll_id;
        this.user_id = user_id;
        this.content = content;
        this.created_at = created_at;
    }
}