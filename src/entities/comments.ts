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
    createdAt: Date;

    constructor(id: number, poll: Polls, user: Users, content: string, createdAt: Date) {
        this.id = id;
        this.poll = poll;
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
    }
}