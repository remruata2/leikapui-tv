import React from "react";
import css from "./SectionHeader.module.less";

const SectionHeader = ({ title, subtitle, icon }) => {
	return (
		<div className={css.headerContainer}>
			<div className={css.leftGroup}>
				<div className={css.accentBar} />
				<h2 className={css.title}>
					{title}
					{subtitle && <span className={css.subtitle}>({subtitle})</span>}
				</h2>
			</div>
			{icon && <div className={css.iconContainer}>{icon}</div>}
		</div>
	);
};

export default React.memo(SectionHeader);
