import { reactive } from 'vue'
//import tiao1 from '../components/tiao1.vue'
import axios from 'axios'
export default function () {
  let dog = reactive(['https://images.dog.ceo/breeds/pembroke/n02113023_5022.jpg'])
  async function addog() {
    try {
      let newe = await axios.get('https://dog.ceo/api/breed/pembroke/images/random')

      dog.push(newe.data.message)
    } catch (error) {
      alert(error)
    }
  }
  return { dog, addog }
}
