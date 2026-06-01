import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../../../core/feature-user/provider/userProvider';
import { List } from '../../CardList/CardList';
import { includes, filter } from 'lodash';

function FavoritesRow({
  contents,
  isFetching,
}: {
  contents: any;
  isFetching: boolean;
}) {
  const { userAccountInfo } = useUser();

  if (!userAccountInfo) return <></>;

  if (userAccountInfo?.liked_contents?.length === 0) {
    return <></>;
  }

  const filteredContents = filter(contents, (content: any) => {
    return includes(userAccountInfo?.liked_contents, content.id);
  });

  if (filteredContents.length === 0) {
    return <></>;
  }

  return (    
    <List
      data={filteredContents}
      showSeeAll={false}
      isFetching={isFetching}
      title="Mis Favoritos"
    />
  );
}

function Favorites({
  contents,
  isFetching,
}: {
  contents: any;
  isFetching: boolean;
}) {
  return <FavoritesRow contents={contents} isFetching={isFetching} />;
}

export default Favorites;
