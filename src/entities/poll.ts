import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PollOptions } from './pollOption';
import { Votes } from './vote';

@Entity()
export class Polls {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    poll_type_id: number;

    @Column()
    user_id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'datetime', nullable: true })
    closed_at: Date | null;

    constructor(
        id: number,
        title: string,
        description: string,
        poll_type_id: number,
        user_id: number,
        created_at: Date,
        closed_at: Date | null
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.poll_type_id = poll_type_id;
        this.user_id = user_id;
        this.created_at = created_at;
        this.closed_at = closed_at;
    }
}