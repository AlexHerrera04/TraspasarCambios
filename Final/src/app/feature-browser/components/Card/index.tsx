import * as React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { capitalize } from 'lodash';
import ContentPlaceholder from '../ContentPlaceholder';

export interface CardData {
  id: string;
  title: string;
  type: string;
  public_image: string;
  short_description: string;
  external_source?: string;
  description: string;
  name: string;
  rating: string;
  origin: string;
}

interface Props extends CardData {
  isSelected: boolean;
}

export const Card = (props: Props) => {
  const hasImage = !!props.public_image;

  return (
    <div>
      <motion.div
        className={classNames({
          'relative flex h-48 flex-col items-center rounded-lg shadow-md shadow-blue-gray-500/10':
            true,
        })}
      >
        {hasImage ? (
          <div
            style={{
              backgroundImage: `url(${props.public_image})`,
            }}
            className="absolute inset-0 rounded-lg bg-center bg-cover bg-gray-600"
          />
        ) : (
          <ContentPlaceholder
            type={props.type}
            className="absolute inset-0 rounded-lg"
          />
        )}

        <span className="absolute left-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
          {capitalize(props.type ? props.type.split('_').join(' ') : 'Generic')}
        </span>

        {props.origin && (
          <span className="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
            {props.external_source
              ? capitalize(props.external_source)
              : capitalize(props.origin)}
          </span>
        )}
      </motion.div>

      <motion.h2 className="mb-0 mt-3 text-lg font-bold">
        {props.name}
      </motion.h2>
      <motion.p className="my-2 text-sm text-white/60">
        {props.short_description}
      </motion.p>
      <motion.div className="text-xs font-bold text-white/60">
        {props.rating}
      </motion.div>
    </div>
  );
};