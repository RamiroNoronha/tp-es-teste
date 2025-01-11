import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PollType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    typeName: string;

    constructor(id: number, typeName: string) {
        this.id = id;
        this.typeName = typeName;
    }
}