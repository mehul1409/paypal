import './App.css'
import axios from 'axios';

function App() {

  const handleSubmit = async(e) => {
    e.preventDefault();

    let res = await axios.post('http://localhost:8000/payment');
    if(res && res.data){
      let link = res.data.links[1].href;
      window.location.href = link;
    }
  } 

  return (
   <>
   <button onClick={handleSubmit}>Pay Now</button>
   </>
  )
}

export default App
