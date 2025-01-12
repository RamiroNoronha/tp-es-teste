import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

import { Users } from './user';
import { Polls } from './poll';

@Entity()
export class Comments {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Polls, poll => poll.id)
    poll: Polls;

    @ManyToOne(() => Users, user => user.id)
    user: Users;

    @Column('text')
    content: string;

    @CreateDateColumn()
    created_at: Date;

    constructor(id: number, poll: Polls, user: Users, content: string, created_at: Date) {
        this.id = id;
        this.poll = poll;
        this.user = user;
        this.content = content;
        this.created_at = created_at;
    }
}