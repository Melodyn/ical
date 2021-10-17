import React from 'react';
import {
  // eslint-disable-next-line
  Root, Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import {
  views, panels, router, routes,
} from './router.js';

const onClick = (route) => () => router.pushPage(route);

const Main = () => {
  const location = useLocation();

  return (
    <View id={views.MAIN} activePanel={location.getViewActivePanel(views.MAIN)}>
      <Panel id={panels.MAIN}>
        <PanelHeader>Hello</PanelHeader>
        <Group>
          <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
          <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
        </Group>
      </Panel>
      <Panel id={panels.KITTY}>
        <PanelHeader>Hello Kitty</PanelHeader>
        <Group>
          <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
          <SimpleCell onClick={onClick(routes.WORLD)}>World</SimpleCell>
        </Group>
      </Panel>
      <Panel id={panels.WORLD}>
        <PanelHeader>Hello World</PanelHeader>
        <Group>
          <SimpleCell onClick={onClick(routes.MAIN)}>Hello</SimpleCell>
          <SimpleCell onClick={onClick(routes.KITTY)}>Kitty</SimpleCell>
        </Group>
      </Panel>
    </View>
  );
};

// const Main = () => (
//   <Root>
//     <View>
//       <Panel>
//         <PanelHeader>Main</PanelHeader>
//         <Group>
//           <SimpleCell>Kitty</SimpleCell>
//           <SimpleCell>World</SimpleCell>
//         </Group>
//       </Panel>
//     </View>
//     <View>
//       <Panel>
//         <PanelHeader>Kitty</PanelHeader>
//         <Group>
//           <SimpleCell>Hello</SimpleCell>
//           <SimpleCell>Kitty</SimpleCell>
//         </Group>
//       </Panel>
//     </View>
//     <View>
//       <Panel>
//         <PanelHeader>World</PanelHeader>
//         <Group>
//           <SimpleCell>Hello</SimpleCell>
//           <SimpleCell>World</SimpleCell>
//         </Group>
//       </Panel>
//     </View>
//   </Root>
// );

export default Main;
