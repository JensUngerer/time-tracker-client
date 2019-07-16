import { InMemoryDataService } from './in-memory-data.service';
import { Injectable } from '@angular/core';
import uuid from 'uuid';
import { IProject } from '../../../common/typescript/iProject';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly projectsKey = 'projects';

  constructor(private inMemoryDataService: InMemoryDataService) { }

  public addProject(projectName: string) {
    const newProject: IProject = {
      name: projectName,
      projectId: uuid.v4()
    };

    this.inMemoryDataService.push(this.projectsKey, newProject);
  }

  public getProjects(): IProject[] {
    return this.inMemoryDataService.get(this.projectsKey);
  }
}
