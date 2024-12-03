"use client";

import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import "swiper/css";
// import "swiper/css/effect-coverflow";
import { useEffect, useRef, useState } from "react";

interface IProps<T> {
  spaceBetween ? : number;
  slideStart: number;
  sliderEnd: number;
  sliderPreview: number;
  className?: string;
  itemClassName ? : string;
  currentIndex : number;
  data: T[];
  renderItem: (item: T) => React.ReactNode;
}

export default function Carousel<T>({
  slideStart,
  spaceBetween,
  sliderEnd,
  sliderPreview,
  className,
  itemClassName,
  data,
  currentIndex,
  renderItem,
}: IProps<T>) {
  const swiperRef = useRef<SwiperRef>(null);

  const slideStarting = useRef(slideStart);
  const slideEnd = useRef(sliderEnd);

  const [sliderPreviewView, setSliderPreviewView] = useState(sliderPreview);

  useEffect(() => {
    if (window.innerWidth <= 639) {
      slideStarting.current = slideStart;
      slideEnd.current = sliderEnd;
      setSliderPreviewView(1);
    } else {
      slideStarting.current = slideStart + 1;
      slideEnd.current = sliderEnd - 1;
      setSliderPreviewView(sliderPreview);
    }

    if (currentIndex !== -1) {
      if (swiperRef.current) {
        swiperRef.current.swiper.slideTo(currentIndex);
      }
    }
  }, [currentIndex]);

  return (
    <Swiper
      slidesPerView={sliderPreviewView}
      ref={swiperRef}
      centeredSlides={false}
      spaceBetween={spaceBetween}
      className={className}
    >
      {data.map((item, index) => (
        <SwiperSlide className={itemClassName} key={index}>{renderItem(item)}</SwiperSlide>
      ))}
    </Swiper>
  );
}
