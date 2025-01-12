import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Polls } from './poll';
import { PollOptions } from './pollOption';
import { Users } from './user';

@Entity()
export class Votes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poll_id: number;

    @Column()
    option_id: number;

    @Column()
    user_id: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Polls, poll => poll.id)
    poll: Polls | null = null;

    @ManyToOne(() => PollOptions, pollOption => pollOption.id)
    pollOption: PollOptions | null = null;

    @ManyToOne(() => Users, user => user.id)
    user: Users | null = null;

    constructor(id: number, poll_id: number, option_id: number, user_id: number, created_at: Date) {
        this.id = id;
        this.poll_id = poll_id;
        this.option_id = option_id;
        this.user_id = user_id;
        this.created_at = created_at;
    }
}