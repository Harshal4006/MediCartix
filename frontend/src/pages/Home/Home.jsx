import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import MedicineDisplay from '../../components/MedicineDisplay/MedicineDisplay'
import WhyUs from '../../components/WhyUs/WhyUs'

const Home = ({ search }) => {

  const [category, setCategory] = useState("All");

  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />

      <MedicineDisplay category={category} search={search} />

      <WhyUs />
    </div>
  )
}

export default Home