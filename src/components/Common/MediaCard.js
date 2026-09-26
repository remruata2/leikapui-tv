import React from "react";
import Spottable from "@enact/spotlight/Spottable";
import css from "./MediaCard.module.less";

const SpottableDiv = Spottable("div");

const MediaCard = ({
	poster,
	title,
	subtitle,
	onClick,
	spotlightId,
	...rest
}) => {
	return (
		<SpottableDiv
			{...rest}
			className={css.cardContainer}
			onClick={onClick}
			spotlightId={spotlightId}
			data-spotlight-id={spotlightId}
			tabIndex={0}
		>
			<div className={css.posterBox}>
				<img
					className={css.posterImage}
					src={poster || "https://placehold.co/300x450/111/fff?text=No+Poster"}
					alt={title}
					loading="lazy"
				/>
			</div>
			<div className={css.titleBelow}>{title}</div>
			{subtitle && <div className={css.metaBelow}>{subtitle}</div>}
		</SpottableDiv>
	);
};

export default React.memo(MediaCard);
