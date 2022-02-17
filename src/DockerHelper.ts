import EnvHelper from './EnvHelper';

export default class DockerHelper {
  constructor(env: EnvHelper) {}

  async stopContainer() {
    console.log('-- stopContainer start');
    console.log('-- stopContainer finished');
  }

  async startContainer() {
    console.log('-- startContainer start');
    console.log('-- startContainer finished');
  }

  static async removeContainer() {
    console.log('-- removeContainer start');
    console.log('-- removeContainer finished');
  }

  static async rebuildImage() {
    console.log('-- rebuildImage start');
    console.log('-- rebuildImage finished');
  }
}
