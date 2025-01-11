import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Poll {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    pollTypeId: number;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    closedAt: Date | null;

    constructor(
        id: number,
        title: string,
        description: string,
        pollTypeId: number,
        userId: number,
        createdAt: Date,
        closedAt: Date | null
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.pollTypeId = pollTypeId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.closedAt = closedAt;
    }
}