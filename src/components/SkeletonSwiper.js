import Skeleton from 'react-loading-skeleton';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';

export const SkeletonSwiper = (props) => {
	const { title, classname, lastTrips, showDistance } = props;

	const slidesPerView=window.innerWidth/320;
    return (
        <div className={classname}>
        <h2>{title}</h2>
        <Swiper
          spaceBetween={50}
          slidesOffsetBefore={30}
          slidesOffsetAfter={30}
          slidesPerView={slidesPerView}
        >
          <SwiperSlide>
            <div className="card">
                    <div className="like-button-wrapper">
                    </div>
                    <div className="swipe-image-wrapper">
                        <h3><Skeleton /></h3>
                        { showDistance &&
                        <p className="distance"><Skeleton /></p>
                        }
                        <Skeleton height={150} />
                    </div>
                    <div className="info">
                        <p><Skeleton count={2} /> </p>
                        { lastTrips && <>
                        <p><Skeleton /></p>
                        <p><Skeleton count={2} /> </p>
                        </> }
                    </div>
                </div>
            </SwiperSlide>
          <SwiperSlide>
            <div className="card">
                    <div className="like-button-wrapper">
                    </div>
                    <div className="swipe-image-wrapper">
                        <h3><Skeleton /></h3>
                        { showDistance &&
                        <p className="distance"><Skeleton /></p>
                        }
                        <Skeleton height={150} />
                    </div>
                    <div className="info">
                        <p><Skeleton count={2} /> </p>
                        { lastTrips && <>
                        <p><Skeleton /></p>
                        <p><Skeleton count={2} /> </p>
                        </> }
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
        </div>

    )
};

