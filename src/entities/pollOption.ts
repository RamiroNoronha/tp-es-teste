import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Polls } from './poll';

@Entity()
export class PollOptions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    poll_id: number;

    @Column()
    option_text: string;

    @ManyToOne(() => Polls, poll => poll.id)
    poll: Polls | null = null;

    constructor(id: number, poll_id: number, option_text: string) {
        this.id = id;
        this.poll_id = poll_id;
        this.option_text = option_text;
    }
}