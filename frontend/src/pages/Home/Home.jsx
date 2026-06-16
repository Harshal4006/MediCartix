import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import MedicineDisplay from '../../components/MedicineDisplay/MedicineDisplay'
import WhyUs from '../../components/WhyUs/WhyUs'

const Home = () => {

  const [category, setCategory] = useState("All");

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />

      <MedicineDisplay category={category} limit={8} />

      <div className="home-view-all-wrap">
        <Link to="/medicines" className="home-view-all-btn">View All Medicines →</Link>
      </div>

      <WhyUs />
    </div>
  )
}

export default Home