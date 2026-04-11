"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Job } from "@/types";
import VacatureCard from "@/components/VacatureCard";

interface Props {
  jobs: Job[];
}

export default function VacatureCarousel({ jobs }: Props) {
  const [displayJobs, setDisplayJobs] = useState<Job[]>([]);

  useEffect(() => {
    const shuffled = [...jobs].sort(() => Math.random() - 0.5);
    setDisplayJobs(shuffled.slice(0, 8));
  }, [jobs]);

  if (displayJobs.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      loop={true}
      breakpoints={{
        0:    { slidesPerView: 1, spaceBetween: 24 },
        640:  { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 32 },
      }}
    >
      {displayJobs.map((job) => (
        <SwiperSlide key={job.id} style={{ height: "auto" }}>
          <VacatureCard job={job} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
